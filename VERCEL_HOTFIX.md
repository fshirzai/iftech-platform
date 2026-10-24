# IFTECH V4 Vercel hotfix — 2026-10-24

## Confirmed cause
`apps/api/src/modules/platform.js` accessed `Project.schema` before the `Project` constant was declared. JavaScript throws a Temporal Dead Zone `ReferenceError` during module import, crashing the function before any route loads.

## Fix
Moved `Project.schema.index({ proposal: 1 }, { unique: true, sparse: true });` **below** the `export const Project = create(...)` declaration. Preserved the unique index and added a regression test.

## Deployment
Commit the corrected module and push. Redeploy `apps/api` on Vercel. Then request `/api/v1/health`. After the startup error is gone, check MongoDB connectivity separately.

## Verification scope
Verified source ordering and Node `--check` syntax. Runtime import test and full deploy still require installed dependencies and deployment environment.
