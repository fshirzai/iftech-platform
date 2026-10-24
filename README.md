# IFTECH — Software Company Platform

An original, responsive Next.js + Node.js + MongoDB implementation starter for **iftech.af**.

## Included

- High-fidelity public website: hero, services, solutions, work, about, contact, project request
- English, Pashto and Dari interface switching (RTL supported)
- Light, dark, and mobile layouts
- Interactive solution catalog and product detail panels
- Visual **dashboard concept preview** with clearly labeled sample metrics
- Functional project inquiry form backed by an Express API, validated with Zod and persisted to MongoDB
- Helmet, CORS, request size limit and form rate limiting
- Responsive navigation, keyboard focus styles, reduced-motion support

## Requirements

Node.js 20+; MongoDB 7+ (local or Atlas).

## Quick start

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

On Windows PowerShell use `Copy-Item` instead of `cp` if preferred.

Open http://localhost:3000 and check API health at http://localhost:4000/api/v1/health.

**MongoDB must be running** for the request form to save. Submitted inquiries are stored in the `projectrequests` collection. For development, view them using MongoDB Compass. No public admin API for reading inquiries is exposed.

## Design choices

- Next.js App Router with `/en`, `/ps`, `/fa` entry points.
- Express API in `apps/api` to keep future operational modules separate from the marketing frontend.
- CSS design system with fluid typography, lime-green accent, custom abstract graphics and fully responsive cards.
- Product examples are illustrative catalog entries, not verified deployed demos or customer case studies.
- No fabricated client testimonials, prices, contact details, or live demo links.

## Not yet implemented (planned)

This is a **working foundation**, not the entire enterprise platform described in SRS v2.0. Before production, implement:

1. Authentication, MFA for staff, RBAC, secure session management
2. Protected admin portal with inquiry review and CMS CRUD
3. Client portal, orders, quotations, invoices and payment verification
4. Project management, milestones, tickets, finance and staff workspaces
5. Demo registry with separately deployed applications and databases
6. Full translated content, not just navigation/marketing interface
7. Email delivery, spam mitigation (CAPTCHA/honeypot), privacy and legal pages
8. Automated tests, monitoring, backups, analytics, SEO and production deployment

The dashboard route is intentionally a *design preview*, not a real management dashboard. Do not expose private records until authentication and server-side authorization are implemented.

## Production notes

Set `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`, `MONGODB_URI` appropriately. Do not commit `.env` files. Place both apps behind TLS and a reverse proxy. Restrict MongoDB network access, use offsite backups, and host demo apps in isolated environments.


## V2 Expanded route pack
See `V2_STATUS.md` for exact implementation status. Portal route examples: `/en/admin/overview`, `/en/client/overview`, `/en/staff/overview`, `/en/sales/overview`, `/en/projects/overview`, `/en/finance/overview`, `/en/support/overview`, `/en/content/overview`. Public routes: `/en/products`, `/en/demos`, `/en/contact`, etc. All portal routes are **unprotected UI previews**. Do not deploy them as real dashboards until authentication and RBAC are implemented.
