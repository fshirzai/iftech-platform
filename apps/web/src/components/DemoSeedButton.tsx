"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
export function DemoSeedButton({locale}:{locale:string}) {
  const [authorized,setAuthorized]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{
    if(process.env.NEXT_PUBLIC_ENABLE_DEMO_SEED!=="true") return;
    api<{user:{role:string}}>("/auth/me").then(x=>setAuthorized(x.user.role==="ADMIN")).catch(()=>setAuthorized(false));
  },[]);
  if(!authorized) return null;
  async function seed() {
    if(!window.confirm("Add clearly marked example products, projects, tasks and a demo client to the configured demo database? Never run against customer data.")) return;
    setBusy(true); setMessage("");
    try {
      const result=await api<{message:string}>("/admin/demo-seed",{method:"POST",body:JSON.stringify({confirmation:"SEED_ISOLATED_DEMO_DATABASE"})});
      setMessage(result.message||"Demo content inserted");
    } catch(e) { setMessage(e instanceof Error?e.message:"Could not insert demo data"); }
    finally { setBusy(false); }
  }
  return <div className="iftech-seed-wrap">
    <button className="iftech-seed-button" disabled={busy} onClick={seed} title="For isolated demo databases only">{busy?"Seeding…":"✳ Seed demo data"}</button>
    {message&&<span role="status" className="iftech-seed-message">{message}</span>}
  </div>;
}
