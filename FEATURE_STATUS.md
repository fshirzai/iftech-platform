# Feature status, risks and work remaining

## Implemented in this deliverable
- Separate Next.js and Express deployable packages in one monorepo.
- Module-based Express routes, Zod inquiry validation, Mongoose persistence.
- Reusable, on-demand MongoDB connection with retry after connection errors.
- Database-aware health endpoint, rate-limited inquiry endpoint, safe API errors.
- Responsive public-site designs, separate public pages and role-specific UI previews.
- Prettier configuration, starter Node tests, environment templates.
- Production guard blocking unauthenticated portal previews by default.

## Not implemented and **not** production ready
- Registration/login, MFA, sessions, password recovery, RBAC, tenant data scoping.
- Authenticated client/staff/admin workspaces and secure API CRUD endpoints.
- Real CMS CRUD, product catalog persistence, file upload, demo isolation.
- Orders, quotations, contracts, invoicing, payments, refunds, subscriptions.
- Live project tasks, messaging, support workflow, notifications, employee and HR features.
- Production analytics and genuine customer references.
- Comprehensive locale translations (many strings are still English).
- Reviewed legal/policy documents, security threat modeling and penetration testing.
- CI/CD, e2e tests, real external-service integration testing.

## Known constraints
- Current inquiry rate limiter uses in-memory store per serverless instance. Use a shared Redis/KV store for robust distributed abuse protection.
- Next.js web dependency versions are inherited from the starter; pin and audit versions before release.
- Existing `Studio.tsx` is a large legacy component; migrate each feature to typed modular components over time.
- Public content contains illustrative products; do not assert availability before verification.
- The free-form public request endpoint requires spam prevention and an explicit privacy notice before public commercial use.
- MongoDB connectivity depends on Atlas network, DNS, TLS, secret rotation and database user permissions; code cannot alone fix an inaccessible cluster.
- Prettier and build scripts are provided, but successful execution requires npm dependencies to be installed.
