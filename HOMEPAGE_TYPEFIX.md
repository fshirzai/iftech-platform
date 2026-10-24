# IFTECH homepage TypeScript fix

`apps/web/src/components/Studio.tsx` has been corrected. The navigation list formerly used `View[]` which widened each menu item to include `request` and `dashboard`. Those are valid views but **not** keys in the translation object, so `t[n]` is invalid. The navigation tuple now uses `as const satisfies readonly View[]` for exact key inference.

Next step: run `npm run build -w @iftech/web`. This ZIP has not passed an installed-dependency production build in this environment.
