# HomeNest — Sprint 7.1 Release Notes

**User Area — Customer Account Hub**

---

## What users can do now

- Visit **My Account** to view and edit their profile — name, phone, and email marketing preference.
- Save, edit, delete, and manage multiple **addresses**, with one default shipping and one default billing address at a time.
- See placeholder **Orders** and **Wishlist** tabs in the account area — clearly marked as coming soon, no live data yet.
- Preview what's coming next: Security, Invoices, Home Projects, Service Bookings, Home Documents, and Warranty Files are shown as upcoming account features.

## What changed internally

- New `/account` area (Profile, Addresses, Orders, Wishlist) built behind the existing session gate from Sprint 7.0.
- Account navigation is driven by a single config that already models all 10 planned account sections, so future features can be turned on without reworking the layout.
- Address create/edit/delete/set-default are real, database-backed operations, scoped so each customer only ever sees their own data.
- No new database tables or permission changes were needed — existing data-access rules already covered this work.
- Visual design matches the rest of the storefront — no admin-style UI leaked into the customer account area.

## Bug fixed during verification

- The Navbar's "Sign out" menu (introduced in the prior sprint) could crash the first time it was opened with a real signed-in session, due to a UI library requirement that hadn't been met. Fixed and re-verified working end-to-end.

## Documentation improvements

- Sprint history, roadmap, and internal engineering notes updated to reflect this sprint's work.
- Testing guide expanded with a corrected session-check method and notes on the bug above, so future verification passes don't need to rediscover it.

## Known external dependencies

- Google Sign-In is built but not yet switched on — it requires a one-time setup step in the Supabase/Google Cloud dashboards, not app code.
- New account registrations require confirming an email address (a setting on the connected Supabase project, outside this codebase).

## Next sprint objective

**Sprint 7.2 — Cart & Session Continuity.** Scope to be finalized, expected to cover merging a shopping cart started before sign-in with the customer's account after logging in. Requires a data-storage decision before implementation begins.

---

*Sprint 7.1 — 2026-07-13*
