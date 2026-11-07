# IFTECH V6 UI and same-origin API gateway

## What changed

- Unified theme colors for homepage, all public routes, and authentication pages; added responsive visual polish and reduced-motion support.
- Added a subtle animated hero, accessible focus indicators, improved interactive cards, and compact mobile styling.
- The homepage, account pages, and public content now call the Express backend through a same-origin Next.js rewrite at `/backend/api/v1/*`. This addresses cross-site session-cookie restrictions on separate `*.vercel.app` origins. No API tokens are exposed.
- Corrected login redirects for ADMIN, CLIENT, SALES, DEVELOPER, PROJECT_MANAGER, FINANCE, SUPPORT and CONTENT_MANAGER.
- Added clearly labeled **preview-only** project cards when no products or portfolio items are published. These do not claim live deployment or real clients.
- Improved browser errors on failed API calls; removed redundant content branch and gave navigation active-state and landmark semantics.

## Required Vercel settings

**Frontend project** (`apps/web`):

- `NEXT_PUBLIC_API_URL=https://iftech-platform.vercel.app` (already set in your prior deployment).
- Optional preferred server-side variable `API_PROXY_TARGET=https://iftech-platform.vercel.app`. It overrides the first setting for the proxy and is not exposed to the browser.
- Redeploy the frontend after any changes. Check `https://iftech-web.vercel.app/backend/api/v1/health` directly. The backend should return `{ "status": "ok", "database": "connected" }` if ready.

**Backend project** (`apps/api`):

- `WEB_ORIGIN=https://iftech-web.vercel.app` (add other actual frontend origins separated by comma).
- `MONGODB_URI`, `AUTH_JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` must be configured for registration.
- Redeploy the backend after any environment change.

## Authentication tests

1. Open `/en/register`, complete valid details, inspect Network POST `/backend/api/v1/auth/register`.
2. A 201 means a verification email should be sent. HTTP 503 means the **backend** registration handler is unavailable: its code explicitly does so if JWT secret or required SMTP values are missing; delivery failure may generate a separate server error.
3. Verify the email link, log in, verify browser receives a host-only `iftech_session` cookie, and check `/backend/api/v1/auth/me`.
4. Test each role redirect independently and confirm role-based access on server routes.

## Verification status

- Backend JavaScript syntax and TS/TSX syntax checked.
- A full `next build` could not be run: dependencies are not installed and network access from the build container is unavailable.
- Deployed website could not be rendered by the available web inspection service; this is a source-code audit and UI improvement, **not** a live visual acceptance test.
- Payment integration, account email delivery, browser cookie behavior, multi-role authorization, and external links require real deployment testing.
- Do not enable demo data seeding in production; it is intentionally restricted to isolated environments.

## Deployment

1. Back up your repository. Do not upload `.env` files or credentials.
2. Replace source files from this package. Keep your actual Vercel environment variables.
3. Run `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
4. Push changes to your existing GitHub repository once tests pass, then redeploy both Vercel projects if needed.
5. Recheck the health URL, register, verify, login, and request submission.

## Scope note

This is a targeted V6 frontend redesign and API reliability release, not a rewrite of all MIS business modules. Existing backend business logic is retained.
