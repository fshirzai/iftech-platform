# IFTECH consolidated replacement — deployment guide

This archive is a **full source snapshot** of the IFTECH V4 work (frontend and backend), combining fixes made through October 25, 2026. It is **not** a fully tested production release.

## What has already been repaired in this archive

- `apps/api/src/app.js` exports `app` as default for the Vercel Express adapter.
- `apps/api/src/modules/platform.js` declares `Project` before registering its index.
- `apps/web/src/components/PortalShell.tsx` uses separately typed `/admin/users` and `/data/{resource}` API responses.
- `apps/web/src/components/Studio.tsx` has a narrowed `nav` tuple for translated menu labels.
- Monorepo includes both `apps/web` (Next.js) and `apps/api` (Express/Mongoose).

## Safe replacement procedure

1. Commit your existing Git changes or clone a backup copy. **Do not delete your working project before verifying the replacement.**
2. Extract this ZIP into a **new folder**. Its root contains `package.json` and `apps/`.
3. Copy in your **own local** environment variable values; never copy them into Git.
4. From the new folder run `npm install`, then `npm run preflight`, `npm run typecheck`, `npm test`, and `npm run build`.
5. If any command fails, do not deploy until diagnosed. If all pass, merge/copy the source into your repository, then commit and push.
6. On Vercel create or maintain separate projects: backend `apps/api`; frontend `apps/web`. Backend requires MongoDB, JWT signing secret, email configuration, and allowed frontend origins. Frontend requires `NEXT_PUBLIC_API_URL` equal to the backend base origin (no `/api/v1` suffix).
7. Verify database health, registration/login, every role's permissions, quote lifecycle, project creation, ticket lifecycle, and HesabPay sandbox end-to-end before customer use.

## Critical delivery limitations

- **No successful full Next.js build or integration test has been demonstrated in this environment.** Package installation timed out.
- Payment merchant integration has not been validated with actual HesabPay credentials, callback delivery, or reconciliation.
- Real SMTP, file handling, production audit and role-isolation testing are required.
- The customer/staff UI and operational flows have not passed a security or accessibility audit.
- Public copies of sample products and any placeholder legal texts require review and replacement.
- The full SRS feature set is **not completed**; consult `FEATURE_STATUS.md` and `RELEASE_NOTES.md`.

## Secret handling

The MongoDB Atlas password previously pasted in chat must be rotated, with the other app's environment updated too. Use a separate `iftech_app` DB user with permissions limited to `iftech_db`. Never commit `.env` or provide the secret in screenshots.
