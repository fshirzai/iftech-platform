# IFTECH V2 status

## Implemented
- Original interactive landing experience at `/en`, `/ps`, `/fa`.
- Dedicated public route pages for the corporate site, products, demo registry preview, careers, blog, legal placeholders and inquiry forms.
- Eight role-specific workspace UI shells, each with individual routes and responsive navigation.
- Light/dark toggle on new public and portal pages.
- English, Pashto and Dari navigation/form labels on new public pages (content is **not** fully translated).
- Existing Express API with MongoDB-backed project request submission and health check.

## Not implemented / do not expose as production features
- Authentication, protected portals, role-based authorization, staff accounts.
- Database-backed product CMS, CRUD, sales, invoices, payment gateway, license enforcement.
- Live demo deployments, file storage, messaging, HR, analytics.
- Legally reviewed policy content.
- Complete localization of content and portals.
- Production deployment, monitoring, automated tests.

**All portal routes are explicitly labeled UI previews and are publicly reachable. Do not put real customer data in them.**
