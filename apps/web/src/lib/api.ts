export const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/,'');
export class ApiError extends Error { constructor(message:string,public status:number){super(message);} }
export async function api<T=any>(path:string,options:RequestInit={}):Promise<T>{
 const response=await fetch(`${API}/api/v1${path}`,{...options,credentials:'include',headers:{'Content-Type':'application/json',...options.headers},cache:'no-store'});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok)throw new ApiError(payload.error||payload.message||`Request failed (${response.status})`,response.status);
 return payload as T;
}
export const titleCase=(s:string)=>s.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
