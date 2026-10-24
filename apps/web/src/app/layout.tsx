import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"IFTECH — Software engineered for what’s next",description:"Software engineering, business platforms, MIS and digital experiences by IFTECH."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
