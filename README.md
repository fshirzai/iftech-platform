# IFTECH Business Platform

A multi-workspace Next.js + Express + MongoDB platform for a software development company.

## Modules in this package

- Public corporate pages, product catalog, demo registry, services, portfolio, articles.
- Registration, email verification, login, password recovery; admin account provisioning.
- Client requests, sales proposals, accept/reject/revision, project creation.
- Projects, tasks, milestones, change requests, support tickets, messages.
- Invoices and HesabPay hosted checkout with signed webhook verification.
- Role-specific portal UI for admin, client, sales, developer, project manager, finance, support, content manager.

**See `RELEASE_NOTES.md` for remaining gaps and compulsory production checks.** This is not a certified complete production deployment.

## Development

From the repository root:

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Set real MONGODB_URI, WEB_ORIGIN, AUTH_JWT_SECRET, SMTP settings.
npm run dev
```

Frontend: http://localhost:3000/en
API: http://localhost:4000/api/v1/health

Initialize first administrator (12+ character password):

```bash
npm run create-admin -w @iftech/api -- admin@example.com "IFTECH Admin" "YOUR-NEW-LONG-RANDOM-PASSWORD"
```

## Vercel

Create two Vercel projects importing the *same monorepo*:

| Project | Root | Environment |
| --- | --- | --- |
| API | `apps/api` | `MONGODB_URI`, `WEB_ORIGIN`, `AUTH_JWT_SECRET`, SMTP and HesabPay variables |
| Web | `apps/web` | `NEXT_PUBLIC_API_URL=https://YOUR-API-DOMAIN` |

`apps/api/src/app.js` exports the Express application as default for Vercel. `server.js` starts the local Node server only.

**Production login:** use proper domain arrangement (`iftech.af` and `api.iftech.af`) and test the cross-origin cookie flow; modern browser privacy restrictions may prevent cookies with unrelated `*.vercel.app` domains.

## Quality commands

```bash
npm run format
npm run format:check
npm run test
npm run typecheck
npm run build
```

## Security

Never commit `.env` files. Rotate any secrets shared in chat. Use dedicated IFTECH MongoDB role limited to `iftech_db`. The public HTTPS site and email verification must be tested before allowing customers to register. Gateway payment verification requires merchant API keys and a registered webhook.
