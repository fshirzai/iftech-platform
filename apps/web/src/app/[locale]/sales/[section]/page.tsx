import {notFound} from "next/navigation";
import {PortalShell} from "../../../../components/PortalShell";
import {portalSections} from "../../../../lib/site-data";
export function generateStaticParams(){return ["en","ps","fa"].flatMap(locale=>portalSections.sales.nav.map(section=>({locale,section})));}
export default async function Page({params}:{params:Promise<{locale:string;section:string}>}){const {locale,section}=await params;if(!["en","ps","fa"].includes(locale)||!portalSections.sales.nav.includes(section as never))notFound();return <PortalShell locale={locale} portal="sales" section={section}/>}
