import {PublicPage} from "../../../components/PublicPage";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <PublicPage locale={locale} slug="about"/>}
