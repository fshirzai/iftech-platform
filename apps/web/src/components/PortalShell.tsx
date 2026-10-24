"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {LayoutDashboard, Menu, X, ArrowUpRight, Search, Bell, Moon, Sun, ChevronRight, ShieldAlert} from "lucide-react";
import {portalSections} from "../lib/site-data";
type PortalKey=keyof typeof portalSections;
const human=(v:string)=>v.replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase());
export function PortalShell({locale,portal,section}:{locale:string;portal:PortalKey;section:string}){
const path=usePathname(),[open,setOpen]=useState(false),[dark,setDark]=useState(true);
const info=portalSections[portal];const nav=[...info.nav];
return <div className={"ifportal "+(dark?"dark":"light")} dir={locale==="en"?"ltr":"rtl"}>
<aside className={"ifportal-sidebar "+(open?"shown":"")}>
<Link className="ifportal-brand" href={`/${locale}`}>✳ <b>IFTECH</b><span>STUDIO</span></Link>
<div className="ifportal-group-label">WORKSPACE / {portal.toUpperCase()}</div>
<nav aria-label="Workspace navigation">{nav.map(n=><Link onClick={()=>setOpen(false)} key={n} className={"ifportal-navitem "+(section===n?"active":"")} href={`/${locale}/${portal}/${n}`}><span className="ifportal-navdot"/> {human(n)} <ChevronRight size={13}/></Link>)}</nav>
<div className="ifportal-sidefoot"><Link href={`/${locale}`}>← Back to website</Link><p>IFTECH / Platform preview</p></div>
</aside>
{open&&<button className="ifportal-overlay" aria-label="Close menu" onClick={()=>setOpen(false)}/>}
<div className="ifportal-main">
<header className="ifportal-top"><button className="ifportal-icon mobile-only" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button><div className="ifportal-crumb">IFTECH <span>/</span> {human(portal)} <span>/</span> <strong>{human(section)}</strong></div><div className="ifportal-top-actions"><button className="ifportal-icon" title="Toggle theme" onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><span className="ifportal-avatar">IF</span></div></header>
<main className="ifportal-content"><div className="ifportal-notice"><ShieldAlert size={18}/><span><strong>UI preview — not a secure account.</strong> This workspace is sample interface only. Authentication, access control and database-backed operations must be implemented before production use.</span></div>
<div className="ifportal-heading"><div><span className="ifportal-kicker">IFTECH / {portal.toUpperCase()}</span><h1>{section==="overview"?info.title:human(section)}</h1><p>{section==="overview"?info.subtitle:`Explore the ${human(section).toLowerCase()} module in the ${human(portal).toLowerCase()}.`}</p></div><span className="ifportal-tag">DESIGN PREVIEW</span></div>
{section==="overview"?<><div className="ifportal-metrics">{[['Open requests','—','Awaiting live data'],['Active projects','—','Awaiting live data'],['Pending actions','—','Awaiting live data'],['Recent activity','—','Awaiting live data']].map(([label,val,detail])=><article className="ifportal-metric" key={label}><span>{label}</span><strong>{val}</strong><small>{detail}</small></article>)}</div><div className="ifportal-panels"><section className="ifportal-panel"><div className="ifportal-panel-head"><h2>Workspace modules</h2><span>{nav.length} modules</span></div><div className="ifportal-tiles">{nav.filter(n=>n!=="overview").slice(0,9).map(n=><Link href={`/${locale}/${portal}/${n}`} key={n}><span className="ifportal-tile-icon">✳</span><b>{human(n)}</b><ArrowUpRight size={17}/></Link>)}</div></section><section className="ifportal-panel"><h2>Getting started</h2><p>Build the backend modules, connect MongoDB, and implement protected sessions before using this workspace with customer information.</p><div className="ifportal-empty">No live data connected</div></section></div></>:<section className="ifportal-panel"><div className="ifportal-panel-head"><h2>{human(section)} records</h2><span>Not connected</span></div><div className="ifportal-toolbar"><div><Search size={17}/> Search will be enabled with the API</div><button disabled title="Requires authentication and backend implementation">+ New {human(section).replace(/s$/,"")}</button></div><div className="ifportal-empty"><LayoutDashboard size={30}/><h3>Module UI ready</h3><p>This section has a dedicated route and navigation. CRUD operations, validation, permissions, and database integration are not yet implemented.</p></div></section>}
</main></div></div>
}
