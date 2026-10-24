import {PortalShell} from '../../../../components/PortalShell';
export default async function Page({params}:{params:Promise<{locale:string;section:string}>}){
 const {locale,section}=await params;
 return <PortalShell locale={locale} portal="finance" section={section}/>;
}
