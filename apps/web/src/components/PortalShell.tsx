'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {api,titleCase} from '../lib/api';
import {ThemePicker} from './ThemePicker';
import {Menu,X,LogOut,RefreshCw,Plus,ArrowUpRight,Shield,Search,CheckCircle2,CreditCard,ChevronRight,House} from 'lucide-react';
type Role='ADMIN'|'SALES'|'DEVELOPER'|'PROJECT_MANAGER'|'FINANCE'|'SUPPORT'|'CONTENT_MANAGER'|'CLIENT';
type User={id:string;name:string;email:string;role:Role};
type Doc=Record<string,any>;
const nav:Record<string,{label:string;resource?:string}[]>={
 admin:[{label:'Overview'},...'products services portfolio articles requests proposals projects tasks milestones changes invoices tickets messages notifications'.split(' ').map(x=>({label:x,resource:x})),{label:'Users',resource:'users'}],
 client:[{label:'Overview'},...['requests','proposals','projects','tasks','milestones','changes','invoices','tickets','messages','notifications'].map(x=>({label:x,resource:x}))],
 sales:[{label:'Overview'},...['requests','proposals','projects','messages'].map(x=>({label:x,resource:x}))],
 projects:[{label:'Overview'},...['projects','tasks','milestones','changes','messages'].map(x=>({label:x,resource:x}))],
 staff:[{label:'Overview'},...['projects','tasks','milestones','messages'].map(x=>({label:x,resource:x}))],
 finance:[{label:'Overview'},...['invoices','projects','proposals'].map(x=>({label:x,resource:x}))],
 support:[{label:'Overview'},...['tickets','messages','projects'].map(x=>({label:x,resource:x}))],
 content:[{label:'Overview'},...['products','services','portfolio','articles'].map(x=>({label:x,resource:x}))],
};
const workspaceFor=(r:Role)=>({ADMIN:'admin',CLIENT:'client',SALES:'sales',DEVELOPER:'staff',PROJECT_MANAGER:'projects',FINANCE:'finance',SUPPORT:'support',CONTENT_MANAGER:'content'})[r];
const schema:Record<string,{name:string,label:string,type?:string,required?:boolean}[]>={
 products:[{name:'title',label:'Product title',required:true},{name:'slug',label:'URL slug',required:true},{name:'category',label:'Category'},{name:'description',label:'Description',type:'textarea'},{name:'demoUrl',label:'Live demo URL',type:'url'},{name:'demoInstructions',label:'Demo instructions',type:'textarea'},{name:'startingPrice',label:'Starting price',type:'number'},{name:'currency',label:'Currency (USD / AFN)'},{name:'published',label:'Publish publicly',type:'checkbox'}],
 services:[{name:'title',label:'Service name',required:true},{name:'slug',label:'URL slug',required:true},{name:'description',label:'Description',type:'textarea'},{name:'published',label:'Publish publicly',type:'checkbox'}],
 portfolio:[{name:'title',label:'Project title',required:true},{name:'description',label:'Description',type:'textarea'},{name:'imageUrl',label:'Image URL',type:'url'},{name:'clientName',label:'Client / industry'},{name:'published',label:'Publish publicly',type:'checkbox'}],
 articles:[{name:'title',label:'Article title',required:true},{name:'slug',label:'URL slug',required:true},{name:'summary',label:'Summary'},{name:'content',label:'Content',type:'textarea'},{name:'published',label:'Publish publicly',type:'checkbox'}],
 requests:[{name:'title',label:'Project title',required:true},{name:'description',label:'Business requirements',type:'textarea',required:true},{name:'category',label:'Category (CUSTOM, PRODUCT, CONSULTATION)'},{name:'budget',label:'Estimated budget',type:'number'},{name:'currency',label:'Currency (USD / AFN)'}],
 proposals:[{name:'request',label:'Request ID',required:true},{name:'title',label:'Proposal title',required:true},{name:'scope',label:'Scope and deliverables',required:true,type:'textarea'},{name:'price',label:'Total amount',type:'number',required:true},{name:'currency',label:'Currency'},{name:'estimatedDays',label:'Estimated days',type:'number'}],
 projects:[{name:'client',label:'Client user ID',required:true},{name:'title',label:'Project name',required:true},{name:'description',label:'Scope overview',type:'textarea'},{name:'manager',label:'Manager user ID'}],
 tasks:[{name:'project',label:'Project ID',required:true},{name:'title',label:'Task title',required:true},{name:'description',label:'Task details',type:'textarea'},{name:'assignee',label:'Developer user ID'}],
 milestones:[{name:'project',label:'Project ID',required:true},{name:'title',label:'Milestone title',required:true},{name:'description',label:'Milestone details',type:'textarea'}],
 changes:[{name:'project',label:'Project ID',required:true},{name:'title',label:'Change title',required:true},{name:'description',label:'Requested change',required:true,type:'textarea'}],
 invoices:[{name:'client',label:'Client user ID',required:true},{name:'project',label:'Project ID'},{name:'description',label:'Invoice description',required:true,type:'textarea'},{name:'amount',label:'Amount',type:'number',required:true},{name:'currency',label:'Currency (AFN for HesabPay)'}],
 tickets:[{name:'project',label:'Project ID (optional)'},{name:'title',label:'Subject',required:true},{name:'description',label:'Issue details',required:true,type:'textarea'}],
 messages:[{name:'recipient',label:'Recipient user ID'},{name:'project',label:'Project ID'},{name:'ticket',label:'Ticket ID'},{name:'body',label:'Message',required:true,type:'textarea'}],
 users:[{name:'name',label:'Employee full name',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'password',label:'Temporary password (12+ characters)',type:'password',required:true},{name:'role',label:'Role (SALES, DEVELOPER, PROJECT_MANAGER, FINANCE, SUPPORT, CONTENT_MANAGER, ADMIN)',required:true}],
};
const noCreate=new Set(['notifications']);
function getId(record:Doc){return String(record._id||record.id||'');}
export function PortalShell({locale,portal,section}:{locale:string;portal:string;section:string}){
 const router=useRouter();const [user,setUser]=useState<User|null>(null),[items,setItems]=useState<Doc[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[open,setOpen]=useState(false),[create,setCreate]=useState(false),[busy,setBusy]=useState(false),[page,setPage]=useState(1),[total,setTotal]=useState(0),[search,setSearch]=useState('');
 const resource=section==='overview'?'':section;
 const links=nav[portal]||nav.client;
 const authorized=user && (user.role==='ADMIN'||workspaceFor(user.role)===portal||(user.role==='SALES'&&portal==='projects'));
 useEffect(()=>{api<{user:User}>('/auth/me').then(x=>{setUser(x.user);if(workspaceFor(x.user.role)!==portal && x.user.role!=='ADMIN')router.replace(`/${locale}/${workspaceFor(x.user.role)}/overview`);}).catch(()=>router.replace(`/${locale}/login`));},[portal,locale,router]);
 async function reload() {
  if (!user) return;
  setLoading(true);
  setError('');
  try {
    if (!resource) {
      setItems([]);
      setTotal(0);
    } else if (resource === 'users') {
      const response = await api<{ items: Doc[] }>('/admin/users');
      const records = response.items ?? [];
      setItems(records);
      setTotal(records.length);
    } else {
      const response = await api<{ items: Doc[]; total: number }>(`/data/${resource}?page=${page}`);
      setItems(response.items ?? []);
      setTotal(response.total ?? response.items?.length ?? 0);
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unable to load records');
  } finally {
    setLoading(false);
  }
}
 useEffect(()=>{if(user&&authorized)void reload();},[user,resource,page]);
 async function createRecord(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const fd=new FormData(e.currentTarget);const fields=schema[resource]||[];const obj:Doc={};for(const f of fields){const v=fd.get(f.name);if(f.type==='checkbox')obj[f.name]=v==='on';else if(v!==null&&String(v).trim()){obj[f.name]=f.type==='number'?Number(v):String(v).trim();}}try{await api(resource==='users'?'/admin/users':`/data/${resource}`,{method:'POST',body:JSON.stringify(obj)});setCreate(false);await reload();}catch(e){setError(e instanceof Error?e.message:'Unable to create record')}finally{setBusy(false)}}
 async function status(id:string,next:string){setBusy(true);setError('');try{await api(`/data/${resource}/${id}/status`,{method:'PATCH',body:JSON.stringify({status:next})});await reload();}catch(e){setError(e instanceof Error?e.message:'Unable to update status')}finally{setBusy(false)}}
 async function decide(id:string,decision:string){setBusy(true);setError('');try{await api(`/data/proposals/${id}/decision`,{method:'POST',body:JSON.stringify({decision})});await reload();}catch(e){setError(e instanceof Error?e.message:'Unable to submit decision')}finally{setBusy(false)}}
 async function checkout(id:string){setBusy(true);setError('');try{const r=await api<{checkoutUrl:string}>(`/payments/invoices/${id}/checkout`,{method:'POST'});window.location.href=r.checkoutUrl;}catch(e){setError(e instanceof Error?e.message:'Payment unavailable')}finally{setBusy(false)}}
 async function logout(){await api('/auth/logout',{method:'POST'}).catch(()=>{});router.replace(`/${locale}/login`)}
 const filtered=items.filter(item=>!search||JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
 return <div className="ifwork"><aside className={'ifwork-side '+(open?'shown':'')}><Link className="ifwork-logo" href={`/${locale}`}>✳ <strong>IFTECH</strong><span>WORKSPACE</span></Link><div className="ifwork-side-label">{titleCase(portal)} / NAVIGATION</div><nav>{links.map(x=><Link key={x.label} onClick={()=>setOpen(false)} className={section===(x.resource||'overview')?'active':''} href={`/${locale}/${portal}/${x.resource||'overview'}`}><span>◇</span>{titleCase(x.label)}<ChevronRight size={13}/></Link>)}</nav><div className="ifwork-sidebottom"><Link href={`/${locale}`}><House size={16}/> Public website</Link><button onClick={logout}><LogOut size={16}/> Sign out</button></div></aside>{open&&<button aria-label="Close navigation" className="ifwork-overlay" onClick={()=>setOpen(false)}/>}<div className="ifwork-area"><header className="ifwork-top"><button className="ifwork-menu" onClick={()=>setOpen(true)}><Menu size={20}/></button><span>IFTECH <b>/ {titleCase(portal)} / {titleCase(section)}</b></span><ThemePicker/><div className="ifwork-user"><span className="ifwork-userdot">✳</span><div><strong>{user?.name||'Signing in...'}</strong><small>{user?.role||'...'}</small></div></div></header><main className="ifwork-content"><div className="ifwork-title"><div><span className="ifwork-label">OPERATIONS / {portal.toUpperCase()}</span><h1>{section==='overview'?'Workspace overview':titleCase(section)}</h1><p>{section==='overview'?'Welcome to your IFTECH workspace. Manage real records and keep work moving.':`Review and manage ${titleCase(section).toLowerCase()} securely.`}</p></div><div className="ifwork-actions"><button onClick={()=>void reload()} title="Refresh"><RefreshCw size={17}/></button>{resource && schema[resource] && !noCreate.has(resource)&&<button className="ifwork-primary" onClick={()=>setCreate(true)}><Plus size={17}/> New {titleCase(resource)}</button>}</div></div>{error&&<div role="alert" className="ifwork-error">{error}</div>}
 {!user||!authorized?<div className="ifwork-panel">Verifying access…</div>:section==='overview'?<><div className="ifwork-stats">{links.filter(x=>x.resource).slice(0,4).map((x,i)=><Link href={`/${locale}/${portal}/${x.resource}`} key={x.label}><span>0{i+1} / MODULE</span><h2>{titleCase(x.label)}</h2><p>Open workspace <ArrowUpRight size={16}/></p></Link>)}</div><div className="ifwork-panel"><span className="ifwork-label">YOUR WORKSPACE</span><h2>Tools for every stage of delivery.</h2><p>Manage customer requests, send proposals, track projects and tasks, handle support and generate invoices through your assigned modules.</p><div className="ifwork-shortcuts">{links.filter(x=>x.resource).map(x=><Link href={`/${locale}/${portal}/${x.resource}`} key={x.label}>{titleCase(x.label)} <ArrowUpRight size={16}/></Link>)}</div></div></>:
 <div className="ifwork-panel"><div className="ifwork-tabletop"><strong>{titleCase(section)} <small>({total} records)</small></strong><label><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search loaded records"/></label></div>{loading?<div className="ifwork-empty">Loading records…</div>:filtered.length===0?<div className="ifwork-empty"><span>✳</span><h3>No records found</h3><p>Records appear here after they are created or assigned to your account.</p></div>:<div className="ifwork-records">{filtered.map(item=><article key={getId(item)} className="ifwork-record"><div><span className="ifwork-recordid">{getId(item)}</span><h3>{item.title||item.name||item.description||item.number||item.email||'New record'}</h3><p>{item.scope||item.description||item.summary||item.body||item.email||'—'}</p><div className="ifwork-recordmeta">{item.status&&<span>{item.status}</span>}{item.role&&<span>{item.role}</span>}{typeof item.amount==='number'&&<span>{item.amount} {item.currency}</span>}{typeof item.price==='number'&&<span>{item.price} {item.currency}</span>}{item.demoUrl&&<a href={item.demoUrl} rel="noopener noreferrer" target="_blank">Open demo ↗</a>}</div></div><div className="ifwork-recordbuttons">{resource==='proposals'&&user.role==='CLIENT'&&item.status==='SENT'&&<><button onClick={()=>decide(getId(item),'ACCEPTED')} disabled={busy}>Accept proposal</button><button onClick={()=>decide(getId(item),'REVISION_REQUESTED')} disabled={busy}>Request revision</button><button onClick={()=>decide(getId(item),'REJECTED')} disabled={busy}>Reject</button></>}{resource==='proposals'&&['SALES','ADMIN'].includes(user.role)&&item.status==='DRAFT'&&<button onClick={()=>status(getId(item),'SENT')} disabled={busy}>Send proposal</button>}{resource==='invoices'&&['FINANCE','ADMIN'].includes(user.role)&&item.status==='DRAFT'&&<button onClick={()=>status(getId(item),'ISSUED')} disabled={busy}>Issue invoice</button>}{resource==='invoices'&&item.status==='ISSUED'&&<button onClick={()=>checkout(getId(item))} disabled={busy}><CreditCard size={16}/> Pay with HesabPay</button>}{resource==='tasks'&&['DEVELOPER','PROJECT_MANAGER','ADMIN'].includes(user.role)&&item.status!=='DONE'&&<button onClick={()=>status(getId(item),item.status==='TODO'?'IN_PROGRESS':item.status==='IN_PROGRESS'?'REVIEW':'DONE')} disabled={busy}>Advance task</button>}{resource==='tickets'&&['SUPPORT','ADMIN'].includes(user.role)&&item.status!=='RESOLVED'&&<button onClick={()=>status(getId(item),'RESOLVED')} disabled={busy}>Resolve</button>}{resource==='notifications'&&!item.read&&<button onClick={async()=>{await api(`/data/notifications/${getId(item)}/read`,{method:'POST'});reload();}}><CheckCircle2 size={16}/> Mark read</button>}</div></article>)}</div>}{total>20&&<div className="ifwork-pagination"><button disabled={page===1} onClick={()=>setPage(x=>x-1)}>Previous</button><span>Page {page}</span><button disabled={page*20>=total} onClick={()=>setPage(x=>x+1)}>Next</button></div>}</div>}
 </main></div>{create&&<div className="ifwork-modal-overlay" onClick={()=>setCreate(false)}><div className="ifwork-modal" onClick={e=>e.stopPropagation()}><div className="ifwork-modalheader"><div><span className="ifwork-label">CREATE RECORD</span><h2>New {titleCase(resource)}</h2></div><button onClick={()=>setCreate(false)}><X/></button></div><form onSubmit={createRecord}>{(schema[resource]||[]).map(f=><label key={f.name}>{f.label}{f.type==='textarea'?<textarea name={f.name} required={f.required} rows={4}/>:f.type==='checkbox'?<input type="checkbox" name={f.name}/>:<input name={f.name} type={f.type||'text'} min={f.type==='number'?0:undefined} step={f.type==='number'?'any':undefined} required={f.required}/>}</label>)}<button type="submit" disabled={busy} className="ifwork-primary">{busy?'Saving...':'Create record'} <ArrowUpRight size={17}/></button></form></div></div>}</div>;
}
