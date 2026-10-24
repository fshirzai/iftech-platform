import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User,Audit } from './platform.js';
import { requireAuth, requireRoles } from './auth.js';
export const adminRouter=Router();
const wrap=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
adminRouter.use(requireAuth,requireRoles('ADMIN'));
adminRouter.get('/users',wrap(async(req,res)=>{
 const users=await User.find().select('name email role verified active createdAt').sort({createdAt:-1}).limit(200).lean();res.json({items:users});
}));
adminRouter.post('/users',wrap(async(req,res)=>{
 const v=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(12),role:z.enum(['ADMIN','SALES','DEVELOPER','PROJECT_MANAGER','FINANCE','SUPPORT','CONTENT_MANAGER'])}).strict().safeParse(req.body);
 if(!v.success)return res.status(400).json({error:'Invalid staff details'});
 const u=await User.create({name:v.data.name,email:v.data.email,passwordHash:await bcrypt.hash(v.data.password,12),role:v.data.role,verified:true});
 await Audit.create({actor:req.user.id,action:'CREATE_STAFF',targetType:'User',targetId:u.id});res.status(201).json({item:{id:u.id,name:u.name,email:u.email,role:u.role}});
}));
adminRouter.patch('/users/:id',wrap(async(req,res)=>{
 const v=z.object({active:z.boolean().optional(),role:z.enum(['ADMIN','SALES','DEVELOPER','PROJECT_MANAGER','FINANCE','SUPPORT','CONTENT_MANAGER','CLIENT']).optional()}).strict().safeParse(req.body);
 if(!v.success)return res.status(400).json({error:'Invalid changes'});
 if(String(req.user.id)===req.params.id&&v.data.active===false)return res.status(409).json({error:'Cannot deactivate your own account'});
 const u=await User.findByIdAndUpdate(req.params.id,{$set:v.data},{new:true});if(!u)return res.status(404).json({error:'Not found'});
 await Audit.create({actor:req.user.id,action:'UPDATE_USER',targetType:'User',targetId:u.id,details:v.data});res.json({item:{id:u.id,name:u.name,email:u.email,role:u.role,active:u.active}});
}));
