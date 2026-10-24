# IFTECH Platform — audited foundation (v0.2)

Next.js web frontend and Express/Mongoose backend in a single npm workspaces monorepo.

## Run locally

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit credentials in your local .env, never commit them
npm run dev
```

- Web: http://localhost:3000/en
- API health: http://localhost:4000/api/v1/health
- Inquiry: `POST /api/v1/requests` (validated, rate-limited, stored in MongoDB).

## Quality scripts

```bash
npm run format
npm run format:check
npm run typecheck
npm test
npm run build
```

## Vercel deployment

Create **two projects** from the same GitHub repository:

- API: Root Directory `apps/api`, environment `MONGODB_URI` (secret), `WEB_ORIGIN` (exact web origin), `NODE_ENV=production`; deploy and check `/api/v1/health`.
- Web: Root Directory `apps/web`, `NEXT_PUBLIC_API_URL=https://<actual-api-domain>`; deploy and check the inquiry form.

`MONGODB_URI` must point to the dedicated `iftech_db`; do not reuse the Trading Company password or database permissions. Vercel functions only cache DB connections within a warm instance; cold instances reconnect. Health returns HTTP 503 when the database is unavailable.

## Feature-status and safety

See `FEATURE_STATUS.md`. This codebase is a **public-facing starter and design system**, **not** a finished software-company ERP or secure client portal. Portal routes are blocked in production by default, because they lack authentication and authorization. To preview their UI on an isolated staging deployment, set `ENABLE_PORTAL_PREVIEWS=true` (never use them with real data).

Do not accept payments, upload customer records, or rely on sample product details until those modules are fully developed, secured and tested. Legal pages are placeholders.
