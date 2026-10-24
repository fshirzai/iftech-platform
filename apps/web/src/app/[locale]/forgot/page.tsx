import Account from '../../../components/Account';
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <Account locale={locale} mode='forgot'/>;}
