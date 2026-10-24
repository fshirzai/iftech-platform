# IFTECH Comprehensive Application — implementation and release status

## Implemented executable software

**Backend**: secure account registration (requires real SMTP), verification, login with HTTP-only cookie, logout, password reset, role checks, staff creation, public product/service/portfolio/article feeds, managed product/service/portfolio/article creation and editing, client project requests, versioned proposals, accept/reject/revision, automatic project creation after approval, task/milestone records and status actions, change requests, support tickets, messages, notifications, invoice creation and issuance, HesabPay hosted checkout session creation (AFN only), HesabPay signature-verification webhook handling and guarded invoice payment marking, basic audit logs, health endpoint.

**Frontend**: existing public studio homepage, content pages, published catalog, live-demo links, contact form, login, registration, verification, password reset, eight role-specific workspaces exposing authorized API-backed records and creation/status operations, responsive navigation and styles.

## Work remaining before any production / client delivery

- **MUST** run `npm install`, `npm test`, `npm run typecheck`, `npm run build`, manual functional tests, and professional security review. Full builds were not available in this offline packaging environment.
- **MUST** create dedicated database user, rotate leaked Atlas password, configure environment values, SMTP, and verify password reset and email delivery.
- **MUST** test HesabPay sandbox sessions and signed webhook events with a valid merchant account. Payment confirmation must be reconciled and financial edge cases (partial payments, refunds, currencies, transaction retries, out-of-order callbacks, multi-invoice payments) tested. Do not accept real money before that.
- **MUST** implement or verify atomic proposal/project creation with MongoDB transactions; require replica set; production needs robust idempotent retry and reconciliation.
- Add thorough backend integration/security tests, frontend E2E tests, continuous integration, dependency audit and observability.
- Complete every portal beyond currently supported workflows (file storage, contracts, licenses, subscriptions, team allocation, reporting, careers, advanced CRM, integrated notifications delivery, true CMS localization, three-language translations including fully grammatical Pashto/Dari, RTL accessibility, client file approval, document templates and invoices PDF).
- Public homepage still includes authored marketing example content, not independently verified customer case studies.
- Financial compliance/privacy, legal policy, terms and refund policies need review.
- Runtime rate limiting uses process-local memory; production serverless needs shared rate limits or WAF rules.
- In production with different frontend/API origins, browser third-party-cookie restrictions may prevent sessions. Prefer same registrable domain (`iftech.af` + `api.iftech.af`) or a same-origin proxy, and validate real browser flows.
- Test Vercel Express entry and Atlas TLS/DNS/server-selection behavior in actual deployment; this release does not prove that the user's Atlas connectivity issue is resolved.

## Setup (local)

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Fill backend secrets and DB settings; ensure MongoDB is reachable.
npm run dev
# API health: http://localhost:4000/api/v1/health
```

To create an initial verified ADMIN, from the project root:

```bash
npm run create-admin -w @iftech/api -- admin@example.com "IFTECH Admin" "ChangeThisVeryLongPassword123!"
```

Do not share this password or use the example password. Production users must be created via secure staff administration.

## Vercel two-project deployment

- `iftech-api`: repository `apps/api` root directory; `MONGODB_URI`, `WEB_ORIGIN`, `AUTH_JWT_SECRET`, SMTP, HesabPay secrets. Set Vercel to use `src/app.js` default Express export; `server.js` is only local host bootstrap.
- `iftech-web`: repository `apps/web` root directory; `NEXT_PUBLIC_API_URL` is the API origin **without `/api/v1`**.
- Add HesabPay webhook URL `https://api.iftech.af/api/v1/payments/hesabpay/webhook` to merchant developer dashboard.
- Verification callback and actual paid status MUST be tested in sandbox before live credentials.

## Not a statement of production readiness

This is a broad functional implementation and a significant upgrade over the demo starter. It is **not certified or verified production ready**, and should not be handed to customers as complete without the above items.
