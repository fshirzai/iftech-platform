import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRoles } from './auth.js';
import { connectDatabase } from '../db/connect.js';
import { User, Product, Service, Portfolio, Project, Task, Milestone, Request, Audit } from './platform.js';

export const demoSeedRouter = Router();
demoSeedRouter.use(requireAuth, requireRoles('ADMIN'));

const catalog = [
  { slug:'trading-mis',title:'TradeFlow — Trading MIS',category:'TRADING',description:'Trading, quotations, warehouse reservations, procurement, and border delivery.',features:['Quotations','Warehouse','Procurement','Shipments'] },
  { slug:'car-dealership',title:'AutoMarket — Car Dealership',category:'AUTOMOTIVE',description:'Vehicle inventory, customer inquiries, dealership operations and analytics.',features:['Vehicle listings','Customer orders','Reports','CRM'] },
  { slug:'discipline-manager',title:'Discipline — Personal Productivity',category:'PRODUCTIVITY',description:'Daily and weekly goals, learning progress, habits and reporting.',features:['Task planning','Habits','Learning','Analytics'] },
  { slug:'school-management',title:'Education OS — School MIS',category:'EDUCATION',description:'A school management solution concept covering students, attendance and examinations.',features:['Students','Attendance','Exams','Reports'] },
];
const services = [
  {slug:'custom-software',title:'Custom software development',description:'Requirements, architecture, UI/UX, implementation, testing, and maintenance.'},
  {slug:'website-development',title:'Web applications and websites',description:'Accessible, mobile-first websites, portals, and business platforms.'},
  {slug:'systems-integration',title:'Business systems integration',description:'APIs, data migration, operations automation, and integration support.'},
];

demoSeedRouter.post('/demo-seed', async (req,res,next)=>{
  try {
    if(process.env.NODE_ENV==='production' || process.env.ENABLE_DEMO_SEED!=='true' || process.env.IFTECH_DEMO_DATABASE!=='true') {
      return res.status(403).json({error:'Demo seeding is disabled for this environment'});
    }
    if(req.body?.confirmation!=='SEED_ISOLATED_DEMO_DATABASE') return res.status(400).json({error:'Confirmation required'});
    await connectDatabase();
    const demoEmail='demo.client@iftech.invalid';
    const password=process.env.DEMO_CLIENT_PASSWORD;
    if(!password || password.length<12) return res.status(503).json({error:'DEMO_CLIENT_PASSWORD must be configured with at least 12 characters'});
    const client=await User.findOneAndUpdate({email:demoEmail},{ $setOnInsert:{name:'Demo Client (sample)',email:demoEmail,passwordHash:await bcrypt.hash(password,12),role:'CLIENT',verified:true,active:true}}, {upsert:true,new:true,setDefaultsOnInsert:true});
    const owned=[];
    for(const item of catalog) {
      const product=await Product.findOneAndUpdate({slug:item.slug},{$setOnInsert:{...item,published:true}}, {upsert:true,new:true,setDefaultsOnInsert:true});
      owned.push(product);
    }
    for(const item of services) await Service.findOneAndUpdate({slug:item.slug},{$setOnInsert:{...item,published:true}}, {upsert:true,new:true,setDefaultsOnInsert:true});
    for(const product of owned.slice(0,3)) {
      await Portfolio.findOneAndUpdate({title:product.title},{$setOnInsert:{title:product.title,description:`Illustrative IFTECH software project: ${product.description}`,clientName:'IFTECH sample showcase',published:true}}, {upsert:true,new:true,setDefaultsOnInsert:true});
      const request=await Request.findOneAndUpdate({client:client._id,title:product.title},{$setOnInsert:{client:client._id,title:product.title,description:`Sample requirements for ${product.title}. For training only; no real customer.`,category:'CUSTOM',status:'REVIEWING'}},{upsert:true,new:true,setDefaultsOnInsert:true});
      const project=await Project.findOneAndUpdate({client:client._id,title:product.title},{$setOnInsert:{client:client._id,title:product.title,description:'SAMPLE PROJECT — created for isolated demo workspace.',status:'PLANNING',progress:15}},{upsert:true,new:true,setDefaultsOnInsert:true});
      await Task.findOneAndUpdate({project:project._id,title:'Review requirements'},{$setOnInsert:{project:project._id,title:'Review requirements',description:'Sample analysis task',status:'TODO'}},{upsert:true,setDefaultsOnInsert:true});
      await Milestone.findOneAndUpdate({project:project._id,title:'Discovery completed'},{$setOnInsert:{project:project._id,title:'Discovery completed',status:'PENDING'}},{upsert:true,setDefaultsOnInsert:true});
    }
    await Audit.create({actor:req.user._id,action:'SEED_DEMO_DATA',targetType:'User',targetId:client._id,details:{catalog:catalog.map(p=>p.slug)}});
    return res.json({message:'Sample catalog, projects, tasks and client created or reused in isolated demo database. No financial transactions were generated.'});
  } catch(error) { next(error); }
});
