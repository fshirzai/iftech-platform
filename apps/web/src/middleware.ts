import {NextRequest,NextResponse} from 'next/server';
export function middleware(request:NextRequest){
 const first=request.nextUrl.pathname.split('/').filter(Boolean)[0];
 if(first&&!['en','ps','fa'].includes(first))return NextResponse.redirect(new URL('/en',request.url));
 return NextResponse.next();
}
export const config={matcher:['/((?!_next|api|favicon.ico|.*\..*).*)']};
