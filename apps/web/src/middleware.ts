import { NextResponse, type NextRequest } from "next/server";

const supported = new Set(["en", "ps", "fa"]);
const internalWorkspaces = new Set([
  "admin", "client", "staff", "sales", "projects", "finance", "support", "content",
]);

export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return NextResponse.next();
  const [locale, workspace] = segments;
  if (!supported.has(locale)) return NextResponse.redirect(new URL("/en", request.url));
  // The portals are design previews, not authenticated business applications.
  // Disable them in production until real login and RBAC are developed.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_PORTAL_PREVIEWS !== "true" &&
    internalWorkspaces.has(workspace)
  ) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|favicon.ico|.*\..*).*)"] };
