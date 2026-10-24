'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {api} from '../lib/api';
import {ThemePicker} from './ThemePicker';
type Mode='login'|'register'|'verify'|'forgot'|'reset-password';
export default function Account({locale,mode}:{locale:string;mode:Mode}){
 const router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const titles={login:'Welcome back',register:'Create your client account',verify:'Verify your email',forgot:'Reset your password','reset-password':'Choose a new password'};
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');setSuccess('');const fd=new FormData(e.currentTarget);const values=Object.fromEntries(fd.entries());
 const query=new URLSearchParams(location.search);
 if(mode==='verify'||mode==='reset-password'){values.token=query.get('token')||String(values.token||'');values.email=query.get('email')||String(values.email||'');}
 try{const result=await api<{user?:{role:string};message?:string}>(`/auth/${mode==='reset-password'?'reset':mode}`,{method:'POST',body:JSON.stringify(values)});
 if(mode==='login')router.push(`/${locale}/${result.user?.role==='CLIENT'?'client':'admin'}/overview`);
 else setSuccess(result.message||'Success.');
 }catch(e){setError(e instanceof Error?e.message:'Unable to complete request');}finally{setBusy(false);}}
 return <main className="ifaccount"><div className="ifaccount-theme"><ThemePicker/></div><Link href={`/${locale}`} className="ifaccount-back">✳ IFTECH / RETURN TO WEBSITE</Link><div className="ifaccount-card"><div className="ifaccount-label">SECURE WORKSPACE ACCESS</div><h1>{titles[mode]}</h1><p>{mode==='login'?'Sign in to manage your projects, proposals, and invoices.':'Your IFTECH account connects you to every stage of your project.'}</p><form onSubmit={submit}>
 {mode==='register'&&<label>Full name<input name="name" required minLength={2} autoComplete="name"/></label>}
 {mode!=='verify'&&<label>Email address<input name="email" type="email" required autoComplete="email" defaultValue={typeof window!=='undefined'?new URLSearchParams(location.search).get('email')||'':''}/></label>}
 {['login','register','reset-password'].includes(mode)&&<label>Password<input name="password" type="password" required minLength={mode==='login'?1:12} autoComplete={mode==='login'?'current-password':'new-password'}/></label>}
 <button disabled={busy} type="submit">{busy?'Processing...':mode==='login'?'Sign in':mode==='register'?'Create account':mode==='verify'?'Verify account':mode==='forgot'?'Send reset instructions':'Update password'} <span>↗</span></button>
 {error&&<p className="ifaccount-error" role="alert">{error}</p>}{success&&<p className="ifaccount-success" role="status">{success}</p>}
 </form><div className="ifaccount-links">{mode==='login'?<><Link href={`/${locale}/register`}>Create an account</Link><Link href={`/${locale}/forgot`}>Forgot password?</Link></>:<Link href={`/${locale}/login`}>Back to sign in</Link>}</div></div></main>;
}
