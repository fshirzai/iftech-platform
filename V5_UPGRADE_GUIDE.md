# IFTECH V5 UI and demo content upgrade

## Changes
- Header sign-in link on landing page; existing internal login route is `/{locale}/login`.
- Five persistent color themes: Midnight, Daylight, Ocean, Violet, Ember. Same picker on landing, public, login and portal layouts.
- Homepage navigation now uses real Next.js routes for services, products, portfolio, about and contact; no duplicate SPA-style public screens.
- Public route header includes demos and consistent navigation. Product cards use CSS-generated mini UI screenshots instead of incorrectly implying real application screenshots.
- Footer: small dark `Seed demo data` button, visible ONLY to a signed-in admin if `NEXT_PUBLIC_ENABLE_DEMO_SEED=true`.
- Demo seed API: POST `/api/v1/admin/demo-seed` with auth and confirmation. **Hard-blocked in production (`NODE_ENV=production`)**. Also requires `ENABLE_DEMO_SEED=true` and `IFTECH_DEMO_DATABASE=true` for a separate non-production database, plus `DEMO_CLIENT_PASSWORD`.
- Seed is repeatable via upserts. Creates clearly marked demo products, services, portfolio entries, a sample client, three projects, tasks and milestones. Does not fabricate financial transactions, invoices, customer case studies or deployed demo URLs.

## Safety
Do not seed your live `iftech_db` or a cluster database containing production customer information. Use a distinct test database such as `iftech_demo_db` and separately scoped Atlas credentials. Never expose the seed endpoint without authorization. The demo client uses `.invalid` email and can only be used in isolated testing.

## Important limitations
Do not present CSS mockups as genuine product screenshots. Replace them with approved, real screenshots once available. Projects are sample records based on previously discussed software; ownership, deployment status and customer results must be verified before publishing as factual case studies.
Full Next.js build, real-browser tests, and real merchant checkout verification are not certified by these source changes. Always run `npm run build` before redeploying.

## Deployment
1. Preserve real secrets in Vercel; do not commit `.env` files.
2. Keep existing production API on `apps/api`, frontend on `apps/web`.
3. `NEXT_PUBLIC_API_URL` should be the origin of the API, not include `/api/v1`.
4. Do not set demo seed flags on production. The footer seed button will not appear there by design.
5. For a preview demo environment only, set `NODE_ENV=development`, `ENABLE_DEMO_SEED=true`, `IFTECH_DEMO_DATABASE=true`, `DEMO_CLIENT_PASSWORD=<unique 12+ char secret>` on an isolated API deployment, `NEXT_PUBLIC_ENABLE_DEMO_SEED=true` on the matching frontend preview, and log in as demo ADMIN. Avoid using a public Vercel preview for writes unless access is restricted.
