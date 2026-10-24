import { Router } from 'express';
import { definitions, Project, Request, Proposal, Invoice, STAFF, User, Notification, Message, Ticket, Task, ChangeRequest, isId } from './platform.js';
import { connectDatabase } from '../db/connect.js';
import { requireAuth, requireRoles, logAudit } from './auth.js';

export const resourceRouter = Router();
const wrap = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const forbidden = (res) => res.status(403).json({error:'Forbidden'});
const bad = (res,details) => res.status(400).json({error:'Invalid data',details});
const isStaff = (user) => STAFF.has(user.role);
async function projectAccess(user, projectId){
  if(!isId(projectId))return false;
  const p=await Project.findById(projectId).lean();
  if(!p)return false;
  if(user.role==='ADMIN'||user.role==='FINANCE'||user.role==='SALES'||user.role==='SUPPORT'||user.role==='CONTENT_MANAGER')return true;
  if(user.role==='CLIENT')return String(p.client)===String(user.id);
  return String(p.manager)===String(user.id)||(p.members||[]).some(x=>String(x)===String(user.id));
}
const owns = (user,doc,def) => user.role==='ADMIN'||(def.owner && String(doc[def.owner])===String(user.id));
const access = async (user,doc,def,resource) => {
  if (resource==='notifications')return String(doc.user)===String(user.id);
  if(resource==='messages')return String(doc.sender)===String(user.id)||String(doc.recipient)===String(user.id)||(doc.project&&await projectAccess(user,doc.project));
  if(def.scoped)return await projectAccess(user,doc[def.scoped]);
  if(def.owner)return owns(user,doc,def)||isStaff(user);
  return isStaff(user);
};
const restrictQuery = async (user,resource,def) => {
  if(resource==='notifications')return {user:user.id};
  if(resource==='messages')return {$or:[{sender:user.id},{recipient:user.id},{project:{$in:await Project.find({client:user.id}).distinct('_id')}}]};
  if(user.role==='ADMIN')return {};
  if(resource==='tasks' && user.role==='DEVELOPER')return {assignee:user.id};
  if(def.scoped && user.role==='CLIENT')return {project:{$in:await Project.find({client:user.id}).distinct('_id')}};
  if(def.scoped && user.role==='DEVELOPER')return {project:{$in:await Project.find({$or:[{manager:user.id},{members:user.id}]}).distinct('_id')}};
  if(def.owner && user.role==='CLIENT')return {[def.owner]:user.id};
  if(resource==='messages')return {$or:[{sender:user.id},{recipient:user.id}]};
  return {};
};
resourceRouter.get('/users/team',requireAuth,requireRoles('ADMIN','PROJECT_MANAGER','SALES','SUPPORT'),wrap(async(req,res)=>{
  const items=await User.find({role:{$ne:'CLIENT'},active:true}).select('name email role').lean();res.json({items});
}));
resourceRouter.get('/:resource',wrap(async(req,res)=>{
  const def=definitions[req.params.resource];if(!def)return res.status(404).json({error:'Unknown resource'});
  await connectDatabase();
  if(def.read==='PUBLIC' && req.query.public==='true'){
    const records=await def.Model.find({published:true}).sort({createdAt:-1}).limit(50).lean();return res.json({items:records});
  }
  return requireAuth(req,res,()=>wrap(async()=>{
    const query=await restrictQuery(req.user,req.params.resource,def);
    const page=Math.max(1,Math.min(1000,Number(req.query.page)||1));const limit=Math.min(50,Math.max(1,Number(req.query.limit)||20));
    const items=await def.Model.find(query).sort({createdAt:-1}).skip((page-1)*limit).limit(limit).lean();
    const total=await def.Model.countDocuments(query);
    res.json({items,total,page,pages:Math.ceil(total/limit)});
  })(req,res,()=>{}));
}));
resourceRouter.get('/:resource/:id',requireAuth,wrap(async(req,res)=>{
  const def=definitions[req.params.resource];if(!def||!isId(req.params.id))return res.status(404).json({error:'Not found'});
  const record=await def.Model.findById(req.params.id).lean();if(!record)return res.status(404).json({error:'Not found'});
  if(!await access(req.user,record,def,req.params.resource))return forbidden(res);
  res.json({item:record});
}));
resourceRouter.post('/:resource',requireAuth,wrap(async(req,res)=>{
  const name=req.params.resource;const def=definitions[name];if(!def)return res.status(404).json({error:'Unknown resource'});
  if(!def.write.includes(req.user.role))return forbidden(res);
  const parsed=def.schema.safeParse(req.body);if(!parsed.success)return bad(res,parsed.error.flatten().fieldErrors);
  const data={...parsed.data};
  if(name==='requests'||name==='tickets'){if(req.user.role!=='CLIENT')return bad(res,'Clients must submit requests from their own account');data.client=req.user.id;}
  if(name==='changes'){
    if(!await projectAccess(req.user,data.project))return forbidden(res);
    const project=await Project.findById(data.project);data.client=project.client;
  }
  if(['tasks','milestones'].includes(name)&&!await projectAccess(req.user,data.project))return forbidden(res);
  if(name==='messages'){
    data.sender=req.user.id;
    if(!data.project&&!data.ticket&&!data.recipient)return bad(res,'Specify a recipient, project, or ticket');
    if(data.project&&!await projectAccess(req.user,data.project))return forbidden(res);
    if(data.ticket){const t=await Ticket.findById(data.ticket);if(!t||(!isStaff(req.user)&&String(t.client)!==String(req.user.id)))return forbidden(res);}
    if(data.recipient&&!data.project&&!data.ticket&&!isStaff(req.user))return forbidden(res);
  }
  if(name==='proposals'){
    const request=await Request.findById(data.request);if(!request)return res.status(404).json({error:'Request not found'});
    data.client=request.client;data.version=1+(await def.Model.countDocuments({request:request.id}));
  }
  if(name==='projects'){const u=await User.findById(data.client);if(!u||u.role!=='CLIENT')return bad(res,'Select a valid client');}
  if(name==='invoices'){const u=await User.findById(data.client);if(!u||u.role!=='CLIENT')return bad(res,'Select a valid client');data.number=`IF-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;}
  const record=await def.Model.create(data);await logAudit(req.user,'CREATE',record);
  res.status(201).json({item:record});
}));
// Update only validated, explicitly allowed fields; immutable relationships remain unchanged.
resourceRouter.patch('/:resource/:id',requireAuth,wrap(async(req,res)=>{
 const {resource,id}=req.params;const def=definitions[resource];
 if(!def||!isId(id))return res.status(404).json({error:'Not found'});
 if(!def.write.includes(req.user.role))return forbidden(res);
 if(!['products','services','portfolio','articles'].includes(resource))return res.status(405).json({error:'Use the dedicated workflow action'});
 const record=await def.Model.findById(id);if(!record)return res.status(404).json({error:'Not found'});
 if(!await access(req.user,record,def,resource))return forbidden(res);
 const editable=['title','description','category','features','images','demoUrl','demoInstructions','startingPrice','currency','published','imageUrl','clientName','summary','content','dueDate','assignee','manager','members','progress'];
 const keys=Object.keys(req.body||{});
 if(!keys.length||keys.some(k=>!editable.includes(k)))return bad(res,'Unsupported update fields');
 const current=record.toObject();
 const base={};for(const k of Object.keys(def.schema.shape)){if(k in current)base[k]=current[k] instanceof Date?current[k].toISOString():current[k];}
 const next=def.schema.safeParse({...base,...req.body});
 if(!next.success)return bad(res,next.error.flatten().fieldErrors);
 for(const k of keys)record[k]=next.data[k];
 await record.save();await logAudit(req.user,'UPDATE',record,{fields:keys});res.json({item:record});
}));
// Explicit state updates, not arbitrary fields, avoid mass assignment.
const states={
  requests:{REVIEWING:['SALES','ADMIN'],CLOSED:['SALES','ADMIN']},
  proposals:{SENT:['SALES','ADMIN']},
  projects:{IN_PROGRESS:['PROJECT_MANAGER','ADMIN'],TESTING:['PROJECT_MANAGER','ADMIN'],CLIENT_REVIEW:['PROJECT_MANAGER','ADMIN'],DELIVERED:['PROJECT_MANAGER','ADMIN'],CLOSED:['ADMIN']},
  tasks:{TODO:['DEVELOPER','PROJECT_MANAGER','ADMIN'],IN_PROGRESS:['DEVELOPER','PROJECT_MANAGER','ADMIN'],REVIEW:['DEVELOPER','PROJECT_MANAGER','ADMIN'],DONE:['DEVELOPER','PROJECT_MANAGER','ADMIN']},
  milestones:{IN_PROGRESS:['PROJECT_MANAGER','ADMIN'],COMPLETED:['PROJECT_MANAGER','ADMIN']},
  tickets:{IN_PROGRESS:['SUPPORT','ADMIN'],WAITING_CLIENT:['SUPPORT','ADMIN'],RESOLVED:['SUPPORT','ADMIN'],CLOSED:['SUPPORT','ADMIN','CLIENT']},
  changes:{ASSESSED:['PROJECT_MANAGER','ADMIN'],APPROVED:['CLIENT'],REJECTED:['CLIENT'],IMPLEMENTED:['PROJECT_MANAGER','ADMIN']},
  invoices:{ISSUED:['FINANCE','ADMIN'],VOID:['FINANCE','ADMIN']},
};
resourceRouter.patch('/:resource/:id/status',requireAuth,wrap(async(req,res)=>{
  const {resource,id}=req.params;const def=definitions[resource];if(!def||!isId(id)||!states[resource])return res.status(404).json({error:'Not found'});
  const record=await def.Model.findById(id);if(!record)return res.status(404).json({error:'Not found'});
  const next=req.body?.status;if(!states[resource][next]?.includes(req.user.role))return forbidden(res);
  if(!await access(req.user,record,def,resource))return forbidden(res);
  if(resource==='changes'&&req.user.role==='CLIENT'&&String(record.client)!==String(req.user.id))return forbidden(res);
  if(resource==='invoices'&&next==='ISSUED'&&record.status!=='DRAFT')return bad(res,'Invoice already issued');
  record.status=next;if(resource==='proposals'&&next==='SENT')record.sentAt=new Date();
  await record.save();await logAudit(req.user,'STATUS',record,{status:next});res.json({item:record});
}));
// Proposal approval is atomic for each proposal, and creates a project exactly once.
resourceRouter.post('/proposals/:id/decision',requireAuth,requireRoles('CLIENT'),wrap(async(req,res)=>{
  if(!isId(req.params.id)||!['ACCEPTED','REJECTED','REVISION_REQUESTED'].includes(req.body?.decision))return bad(res,'Invalid decision');
  const proposal=await Proposal.findOneAndUpdate({_id:req.params.id,client:req.user.id,status:'SENT'},{$set:{status:req.body.decision,feedback:String(req.body.feedback||'').slice(0,2000),...(req.body.decision==='ACCEPTED'?{acceptedAt:new Date()}:{})}},{new:true});
  if(!proposal)return res.status(409).json({error:'Proposal not found or already decided'});
  if(proposal.status==='ACCEPTED'){
    await Request.updateOne({_id:proposal.request},{$set:{status:'APPROVED'}});
    await Project.updateOne({proposal:proposal.id},{$setOnInsert:{proposal:proposal.id,client:proposal.client,title:proposal.title,description:proposal.scope,status:'PLANNING'}},{upsert:true});
  }
  await logAudit(req.user,'PROPOSAL_DECISION',proposal,{decision:proposal.status});res.json({item:proposal});
}));
resourceRouter.post('/notifications/:id/read',requireAuth,wrap(async(req,res)=>{
  if(!isId(req.params.id))return bad(res,'Invalid id');
  const item=await Notification.findOneAndUpdate({_id:req.params.id,user:req.user.id},{read:true},{new:true});
  if(!item)return res.status(404).json({error:'Not found'});res.json({item});
}));
