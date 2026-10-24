import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Router } from 'express';
import { z } from 'zod';
import { User, Audit } from './platform.js';
import { connectDatabase } from '../db/connect.js';

export const authRouter = Router();
const secret = process.env.AUTH_JWT_SECRET;
const prod = process.env.NODE_ENV === 'production';
const cookieName = 'iftech_session';
const asyncRoute = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const emailTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.EMAIL_FROM) return null;
  return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE === 'true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});
};
const sendMail = async (to,subject,body) => {
  const t = emailTransport(); if (!t) throw Object.assign(new Error('Email delivery is not configured'),{status:503});
  await t.sendMail({from:process.env.EMAIL_FROM,to,subject,text:body});
};
const cookieOptions = { httpOnly: true, secure: prod, sameSite: prod ? 'none':'lax', maxAge: 7*86400*1000, path:'/' };
const publicUser = (u) => ({id:String(u.id),name:u.name,email:u.email,role:u.role,verified:u.verified});
const issueCookie = (res,u) => { if (!secret) throw Object.assign(new Error('Authentication not configured'),{status:503});res.cookie(cookieName,jwt.sign({sub:String(u.id),role:u.role},secret,{expiresIn:'7d',issuer:'iftech-api'}),cookieOptions); };
export const requireAuth = asyncRoute(async(req,res,next)=>{
  if (!secret) return res.status(503).json({error:'Authentication not configured'});
  const token=req.cookies?.[cookieName];
  if(!token) return res.status(401).json({error:'Sign in required'});
  let payload;try{payload=jwt.verify(token,secret,{issuer:'iftech-api'});}catch{return res.status(401).json({error:'Session expired'});}
  await connectDatabase();
  const user=await User.findById(payload.sub);
  if(!user||!user.active||!user.verified)return res.status(401).json({error:'Account unavailable'});
  req.user=user;next();
});
export const requireRoles = (...roles) => (req,res,next) => roles.includes(req.user?.role)?next():res.status(403).json({error:'Forbidden'});
const registerSchema=z.object({name:z.string().trim().min(2).max(100),email:z.string().email().max(200),password:z.string().min(12).max(128)}).strict();
authRouter.post('/register',asyncRoute(async(req,res)=>{
  const parsed=registerSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid registration',details:parsed.error.flatten().fieldErrors});
  if(!secret || !emailTransport())return res.status(503).json({error:'Account registration is temporarily unavailable'});
  await connectDatabase();const {name,email,password}=parsed.data;
  if(await User.exists({email:email.toLowerCase()}))return res.status(409).json({error:'Email already registered'});
  const token=crypto.randomBytes(32).toString('hex');
  const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),verificationHash:hash(token),verificationExpires:new Date(Date.now()+3600000)});
  try{await sendMail(email,'Verify your IFTECH account',`Verify your account using this link: ${process.env.WEB_ORIGIN?.split(',')[0]||'http://localhost:3000'}/en/verify?token=${token}&email=${encodeURIComponent(email)}`);}
  catch(err){await User.deleteOne({_id:user.id});throw err;}
  res.status(201).json({message:'Check your email for a verification link'});
}));
authRouter.post('/verify',asyncRoute(async(req,res)=>{
  const parsed=z.object({email:z.string().email(),token:z.string().length(64)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid verification'});
  await connectDatabase();
  const user=await User.findOne({email:parsed.data.email.toLowerCase(),verificationHash:hash(parsed.data.token),verificationExpires:{$gt:new Date()}}).select('+verificationHash');
  if(!user)return res.status(400).json({error:'Invalid or expired verification link'});
  user.verified=true;user.verificationHash=undefined;user.verificationExpires=undefined;await user.save();res.json({message:'Account verified'});
}));
authRouter.post('/login',asyncRoute(async(req,res)=>{
  const parsed=z.object({email:z.string().email(),password:z.string().min(1)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid credentials'});
  await connectDatabase();const user=await User.findOne({email:parsed.data.email.toLowerCase()}).select('+passwordHash');
  if(!user||!await bcrypt.compare(parsed.data.password,user.passwordHash))return res.status(401).json({error:'Invalid email or password'});
  if(!user.active||!user.verified)return res.status(403).json({error:'Account not verified or inactive'});
  issueCookie(res,user);res.json({user:publicUser(user)});
}));
authRouter.get('/me',requireAuth,(req,res)=>res.json({user:publicUser(req.user)}));
authRouter.post('/logout',(_req,res)=>{res.clearCookie(cookieName,{...cookieOptions,maxAge:undefined});res.json({message:'Signed out'});});
authRouter.post('/forgot',asyncRoute(async(req,res)=>{
  const parsed=z.object({email:z.string().email()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid email'});
  await connectDatabase();const user=await User.findOne({email:parsed.data.email.toLowerCase()});
  if(user && emailTransport()){
    const token=crypto.randomBytes(32).toString('hex');user.resetHash=hash(token);user.resetExpires=new Date(Date.now()+900000);await user.save();
    await sendMail(user.email,'Reset IFTECH password',`Reset your password: ${process.env.WEB_ORIGIN?.split(',')[0]||'http://localhost:3000'}/en/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`);
  }
  res.json({message:'If the account exists, reset instructions have been sent'});
}));
authRouter.post('/reset',asyncRoute(async(req,res)=>{
  const parsed=z.object({email:z.string().email(),token:z.string().length(64),password:z.string().min(12).max(128)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid reset request'});
  await connectDatabase();const user=await User.findOne({email:parsed.data.email.toLowerCase(),resetHash:hash(parsed.data.token),resetExpires:{$gt:new Date()}}).select('+resetHash');
  if(!user)return res.status(400).json({error:'Invalid or expired reset link'});
  user.passwordHash=await bcrypt.hash(parsed.data.password,12);user.resetHash=undefined;user.resetExpires=undefined;await user.save();res.json({message:'Password updated'});
}));
export const logAudit = async (user,action,doc,details={}) => {await Audit.create({actor:user.id,action,targetType:doc.constructor.modelName,targetId:doc.id,details});};
