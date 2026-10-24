import { Router } from 'express';
import { Invoice, Payment } from './platform.js';
import { connectDatabase } from '../db/connect.js';
import { requireAuth } from './auth.js';
export const paymentRouter = Router();
const wrap=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
// Official HesabPay checkout API. No invoices are considered paid from a browser redirect.
paymentRouter.post('/invoices/:id/checkout',requireAuth,wrap(async(req,res)=>{
  await connectDatabase();
  const invoice=await Invoice.findById(req.params.id);
  if(!invoice||invoice.status!=='ISSUED')return res.status(404).json({error:'Payable invoice not found'});
  if(req.user.role!=='ADMIN'&&String(invoice.client)!==String(req.user.id))return res.status(403).json({error:'Forbidden'});
  if(invoice.currency!=='AFN')return res.status(422).json({error:'HesabPay checkout requires an AFN-denominated invoice for this configuration'});
  const key=process.env.HESABPAY_API_KEY;
  if(!key)return res.status(503).json({error:'HesabPay merchant integration is not configured'});
  const payment=await Payment.create({invoice:invoice.id,client:invoice.client,amount:invoice.amount,currency:invoice.currency});
  const endpoint=process.env.HESABPAY_MODE==='production'?'https://api.hesab.com/api/v1/payment/create-session':'https://api-sandbox.hesab.com/api/v1/payment/create-session';
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`API-KEY ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email:req.user.email,user_id:String(payment.id),items:[{id:String(invoice.id),name:`IFTECH Invoice ${invoice.number}`,price:invoice.amount}],redirect_success_url:`${process.env.WEB_ORIGIN?.split(',')[0]||'http://localhost:3000'}/en/client/invoices`,redirect_failure_url:`${process.env.WEB_ORIGIN?.split(',')[0]||'http://localhost:3000'}/en/client/invoices`}),signal:AbortSignal.timeout(15000)});
    const result=await response.json();
    if(!response.ok||!result.success||typeof result.url!=='string'||!result.url.startsWith('https://'))throw new Error(`Gateway session rejected (${response.status})`);
    payment.checkoutUrl=result.url;await payment.save();res.json({checkoutUrl:result.url,paymentId:payment.id});
  }catch(err){payment.status='FAILED';await payment.save();console.error('HesabPay session creation failed',err.message);res.status(502).json({error:'Unable to create checkout session'});}
}));
// Confirm only gateway-verified events. Redirects never mark an invoice paid.
paymentRouter.post('/hesabpay/webhook',wrap(async(req,res)=>{
 const event=req.body||{};
 if(typeof event.signature!=='string'||typeof event.timestamp!=='string'||!event.user_id)
   return res.status(400).json({error:'Invalid webhook payload'});
 if(!process.env.HESABPAY_API_KEY)return res.status(503).json({error:'Payment verification unavailable'});
 const base=process.env.HESABPAY_MODE==='production'?'https://api.hesab.com':'https://api-sandbox.hesab.com';
 try{
   const r=await fetch(`${base}/api/v1/hesab/webhooks/verify-signature`,{
     method:'POST',headers:{Authorization:`API-KEY ${process.env.HESABPAY_API_KEY}`,'Content-Type':'application/json'},
     body:JSON.stringify({signature:event.signature,timestamp:event.timestamp}),signal:AbortSignal.timeout(15000)
   });
   const verified=await r.json();
   if(!r.ok||verified.success!==true)return res.status(401).json({error:'Invalid webhook signature'});
 }catch(error){console.error('HesabPay webhook verification request failed',error.message);return res.status(503).json({error:'Verification unavailable'});}
 await connectDatabase();
 if(event.success!==true||event.status_code!==10){
   await Payment.updateOne({_id:event.user_id,status:'PENDING'},{$set:{status:'FAILED'}});
   return res.json({received:true});
 }
 if(typeof event.transaction_id!=='string'||!event.transaction_id||!Number.isFinite(Number(event.amount)))
   return res.status(400).json({error:'Incomplete payment confirmation'});
 const payment=await Payment.findById(event.user_id);
 if(!payment)return res.status(404).json({error:'Unknown payment reference'});
 if(Math.abs(Number(event.amount)-Number(payment.amount))>0.009)return res.status(409).json({error:'Payment amount mismatch'});
 const existing=await Payment.findOne({providerReference:event.transaction_id,status:'SUCCEEDED'});
 if(existing && String(existing.id)!==String(payment.id))return res.status(409).json({error:'Duplicate transaction identifier'});
 if(payment.status==='SUCCEEDED')return res.json({received:true,duplicate:true});
 if(payment.status!=='PENDING')return res.status(409).json({error:'Payment attempt no longer pending'});
 const updated=await Payment.findOneAndUpdate({_id:payment.id,status:'PENDING'},{$set:{status:'SUCCEEDED',providerReference:event.transaction_id,verificationData:{transaction_id:event.transaction_id,timestamp:event.timestamp}}},{new:true});
 if(updated){await Invoice.updateOne({_id:payment.invoice,status:'ISSUED'},{$set:{status:'PAID',paidAt:new Date()}});}
 res.json({received:true});
}));
