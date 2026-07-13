# HomeNest Session

## Current Sprint
Sprint 6.1 (remaining) — complete. Sprint 6.1 is now fully done.

## Last Completed
- ✅ Product Create
- ✅ Product Read (Live Supabase)
- ✅ Admin Login
- ✅ Product Search
- ✅ Product Filters
- ✅ Pagination
- ✅ RLS for Product CRUD
- ✅ Product Edit (Sprint 7.1)
- ✅ Product Delete (soft), Archive, Restore, Duplicate
- ✅ Image upload to Supabase Storage
- ✅ Real Product Quality scoring (deterministic, not AI)

## Current Status
Product CRUD is fully operational: Create, Read/List, Update, Delete, Archive/Restore, Duplicate.
Admin products page reads live data from Supabase; `ProductActionsMenu` is fully wired.
Image upload works end-to-end (Storage → media → product_images); the Add/Edit Product Studio's
Media section is real, not a placeholder. Product Quality scores are real, computed from form
completeness — not AI-generated (that's still Sprint 9).
See ADR-018 in docs/DECISIONS.md for the full reasoning behind this sprint's decisions.

## Current Branch
main

## Next Task
Sprint 7 — Full Authentication (customer accounts, OAuth, register, password reset). Do NOT start
without explicit user instruction — see docs/ROADMAP.md.

## Known Issues
- ESLint toolchain issue (pre-existing)
- Remaining RLS policies for Orders and Payments
- No automated tests yet
- No dedicated Media Library yet — each product's images are uploaded fresh, none are reusable
  across products (not yet scheduled to a sprint)
- Full interactive testing of the admin write paths (Delete/Archive/Restore/Duplicate/image
  upload) still requires the one-time manual admin-account step from Sprint 6 (docs/ROADMAP.md) —
  build and TypeScript checks pass, but this session could not exercise the authenticated flows
  in a browser

## Do Not Change
- Design system
- RLS-first architecture
- No Service Role Key
- Product Studio layout
- Existing ADR decisions

## Long-Term Vision
HomeNest's long-term direction: an AI-native commerce operating system. The owner eventually only selects products, approves key AI decisions, monitors analytics, and sets strategy — specialized AI agents (Research, Import, Optimization, SEO, Pricing, Image Generation, Marketing, Advertising, Email, Social, Support, Inventory, Analytics, Operations) handle the rest. Strategic guidance only — does not change the current roadmap, does not add AI sprints. Full statement: PROJECT_VISION.md. Recorded as ADR-017 in docs/DECISIONS.md.

## Important Documents
- CLAUDE_CONTEXT.md
- PROJECT_VISION.md
- docs/ROADMAP.md
- docs/DECISIONS.md
- docs/DATABASE.md

## Notes
Always read the files above before starting work.
Never redesign existing UI without approval.
Reuse existing components whenever possible.