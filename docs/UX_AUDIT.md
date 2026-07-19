# HomeNest — UX & Product Audit

> Sprint 9.0 — Product Audit & UX Vision
> Planning and review document only. No implementation proposed here — see
> `docs/ROADMAP.md` for what gets scheduled and when.
> Every finding below was verified against the live application (dev server,
> desktop 1440×900 and mobile 375×812) or the actual source file cited — not
> inferred from the design system alone.

---

## 1. Executive Summary

HomeNest's *built* commerce core — checkout, the Order Engine, Stripe payment
processing, RLS-first security, the account hub — is genuinely strong, and
stronger than the surface of the site currently lets on. Sprints 6 through
8.4 produced a checkout and payment path that's atomic, concurrency-safe, and
live-verified end to end (see `docs/DECISIONS.md` ADR-022–024, `TESTING.md`
§5a). That is not where this audit's urgency lies.

The urgency is that **the parts of the site every visitor sees first are
inconsistent with the parts that actually work**, in ways that are not
subtle once you look. This audit found:

- **A live, quantifiable pricing bug on the Cart page.** It advertises free
  shipping at $500 and charges $45 below that — while the homepage, the
  "Our Standard" section, and the real checkout flow all say free shipping
  starts at **$50**. A customer with a $48 cart sees "Add $452 more for free
  shipping" on the page immediately before checkout. See §4 (Cart), §5, §7.
- **The primary navigation search does nothing.** The magnifying-glass icon
  in the header opens a full-screen overlay with a text input and
  "popular search" suggestion chips — none of which submit, navigate, or do
  anything else. There is no `<form>`, no `onSubmit`, no `Enter`-key
  handling. See §4 (Search), §5.
- **The homepage's "AI Smart Search" is not search.** It's an honestly
  commented placeholder (`// AI INTEGRATION POINT`) that pushes the typed
  query into a URL param the destination page never reads. Typing "my sink
  gets wet" and pressing Search lands on the full, unfiltered catalogue. See
  §4 (Search), §7.
- **The whole site is still titled and described as a furniture store.**
  The `<title>` tag, meta description, and footer copy ("Curated furniture
  and home accessories for a life well lived") are leftover from a
  template scaffold and contradict every other page's actual "Smart Home
  Solutions" positioning, including the SEO snippet Google would show. See
  §2, §7.
- Several primary-looking CTAs are dead (`Buy Now` on the product page has
  no click handler at all), and most of the footer's secondary links
  (`About Us`, `FAQ`, `Shipping & Returns`, `Privacy Policy`, etc.) point to
  `href="#"`.

None of this is architecturally hard to fix — these are shallow, isolated
bugs and copy mismatches, not systemic design flaws. That's the good news:
Sprint 9 can close most of them without touching the checkout/payment core
that already works. The Prioritized Improvement Roadmap (§11) and Quick
Wins (§12) reflect that — this is mostly a *correction and finishing* sprint,
not a redesign.

---

## 2. Current Product Assessment

**What's real and working today**, verified across this project's own
session history and this audit:

| Layer | Status | Evidence |
|---|---|---|
| Catalogue, product detail, reviews, FAQ | Strong, content-complete | §4 Product |
| Cart (client-side state) | Functional, but has the shipping-threshold bug | §4 Cart |
| Checkout (guest-can-browse, identify-to-order) | Strong, thoroughly tested | Sprint 8.0–8.1, `TESTING.md` §7 |
| Order Engine (atomicity, concurrency) | Strong | `create_order_atomic()`, ADR-023 |
| Stripe payments | Strong, live-verified end to end | ADR-024, `TESTING.md` §5a |
| RLS / security posture | Strong, audited repeatedly | ADR-013 and every subsequent RLS-touching sprint |
| Account hub (Profile, Addresses) | Strong | Sprint 7.1 |
| Account hub (Orders, Wishlist) | **UI-only placeholder** — no real data | `SESSION.md` Known Issues |
| Search (navbar overlay) | **Non-functional** | §4 Search |
| Search (homepage "AI Smart Search") | **Cosmetic placeholder, not wired** | §4 Search |
| Site-wide brand metadata (title, meta description, footer) | **Wrong brand** (furniture-store template leftover) | §2, §7 |

**Read on this:** HomeNest has built its transaction backbone (the hard,
security-sensitive part) to a high standard, and left its storefront
surface (the easy, cosmetic part) still carrying the scaffold it was
generated from. That's a normal and low-risk place to be mid-project — but
it's exactly backwards from what a first-time visitor experiences, since
they meet the storefront surface first and the checkout quality last.

---

## 3. User Journey Review

PROJECT_VISION.md mandates one journey for the homepage: **Problem → Solution
→ Benefits → Reviews → Purchase**. The homepage's actual section order
follows this closely and well: Hero (problem framing) → "AI Smart Search"
(problem intake) → "Shop by Problem" (solution categories) → trust marquee
→ Mission → "Browse by Need" → Best Sellers → "Our Standard" (benefits) →
trust badges → Testimonials (reviews) → Newsletter. Structurally, this is a
faithful, well-executed implementation of the intended journey.

**Where the journey actually breaks is at the transition points, not the
sections themselves:**

- **Problem → Solution, via search, breaks twice.** A visitor's first
  instinct on a "describe your problem" site is to type their actual
  problem. Both places they can do that (navbar search, homepage "AI Smart
  Search") fail to connect them to a solution — one silently does nothing,
  the other silently shows everything. Neither tells the user it didn't
  understand them. This is the single most consequential journey break on
  the site, because it undermines the exact promise ("Describe it in your
  own words. We'll find the right solution.") the homepage makes in large
  type.
- **Solution → Purchase, via the cart, breaks on trust.** A customer who
  successfully browses by category or clicks "Add to Cart" from a product
  card reaches the Cart page and is shown a shipping cost and threshold
  that contradict every trust badge they scrolled past minutes earlier.
  This is a classic late-funnel trust break — the kind that produces cart
  abandonment specifically because it appears at the moment of highest
  purchase intent.
- **Purchase, once actually reached, is solid.** Checkout → payment →
  confirmation is the best-tested, most reliable part of the journey (see
  §4 Checkout). The problem is how many visitors the two breaks above
  filter out before they ever get there.

---

## 4. Page-by-Page Audit

### Landing (`/`, `src/app/page.tsx` + `src/components/home/*`)

**Strengths:** Faithful Problem→Solution→Benefits→Reviews→Purchase
structure (§3). Strong editorial typography and motion design consistent
with `DESIGN_SYSTEM.md`. Real, specific trust numbers (50k+ homes, 18
countries, 4.9 rating) presented consistently in three separate places
(hero stats, "Our Standard," trust marquee) — good reinforcement, not
repetition fatigue, because each appearance adds a different framing.

**Weaknesses:**
- "AI Smart Search" section (`SmartSearchSection.tsx`) is non-functional as
  search — see §5.
- Nav's "How It Works" and "Journal" links resolve to `href="#"`
  (`Navbar.tsx:93-94`, confirmed live). The hero section has its own,
  separate "How It Works" text link that isn't dead but is mislabeled —
  it's `<Link href="/products">` (`HeroSection.tsx:291`), so it silently
  sends a visitor looking for an explainer straight to the product
  catalogue instead.
- Footer content (brand tagline, $500 free-shipping claim, "Living
  Room/Bedroom/Office" categories, all secondary links) is leftover
  furniture-store template copy — see §7 for the full breakdown.
- Best Sellers shows exactly 6 of 9 catalogue products with no visible
  selection logic explained to the user (not wrong, just unexplained —
  low severity).

### Product (`/products/[slug]`, `src/components/product/*`)

**Strengths:** This is the site's best-built page. Problem framing, numbered
solution steps, "why it works" feature grid, gallery, a real product video,
a genuine review distribution (67%/33%/0%/0%/0% for a 4.8 average — this is
internally consistent, not a fabricated-looking round number), and a
relevant FAQ. This page alone does more to fulfil the brand's "helpful,
knowledgeable friend" voice (`DESIGN_SYSTEM.md` §1) than any other page.

**Weaknesses:**
- **"Buy Now" button has no `onClick` at all**
  (`ProductHero.tsx:296-305`) — confirmed by reading the component; the
  `<motion.button>` has `whileTap` but no click handler, event, or link.
  It is visually identical in weight to "Add to Cart" (full-width, bordered,
  hover-inverts to filled) so a user has no visual cue that one of the two
  primary purchase actions is dead.
- **FAQ promises a colour choice the page doesn't offer.** "Which colour
  should I choose? We offer white… stone… and charcoal…" appears in the
  FAQ accordion, but there is no colour/variant selector anywhere in
  `ProductHero.tsx` (confirmed by source search — no `variant`/`colour`
  state or UI exists). Every customer adds the same single SKU to cart
  regardless of what the FAQ told them to consider.
- Wishlist heart button is wired to local component state only
  (`onWishlist` prop, no persistence) — consistent with Orders/Wishlist
  being a known UI-only placeholder sitewide, but worth naming here since
  it's the one interactive control on this specific page that looks fully
  real and isn't.

### Search (navbar overlay, `SearchOverlay` in `Navbar.tsx:104-211`)

**This is the most severe functional gap found in this audit.** The overlay
opens correctly (backdrop, focus management, Escape-to-close, `aria-modal`/
`role="dialog"` all present and correct), but the search itself is entirely
inert:
- The `<input type="search">` (`Navbar.tsx:144-151`) has only an `onChange`
  — no wrapping `<form>`, no `onSubmit`, no `onKeyDown` for `Enter`.
- The eight "Popular searches" suggestion chips
  (`Navbar.tsx:172-180`) only call `setQuery(term)` — they fill the input,
  they don't search.
- The only working affordances in the entire overlay are closing it and the
  unrelated "Browse by room" category links at the bottom, which bypass the
  typed query entirely.

There is currently no way, anywhere in the product, to type a query and see
filtered results — not on the navbar overlay, and not (functionally) on the
homepage's "AI Smart Search," which does navigate but to a page that
ignores the query (`/app/products/page.tsx:12` only destructures
`category`/`sort` from `searchParams`; there is no `q` handling at all).

### Cart (`/cart`, `src/app/cart/page.tsx`)

**Strengths:** Clean, standard cart layout — line items, quantity controls,
promo code field, order summary, "Continue shopping" — nothing structurally
wrong, and the underlying Zustand + `persist` state (guest-safe,
merge-on-login) is one of the most thoroughly engineered parts of this
codebase (Sprint 7.2).

**Weaknesses — one high-severity, verified bug:**
- `const shipping = total >= 500 ? 0 : 45;` and
  `Add ${(500 - total).toLocaleString()} more for free shipping`
  (`cart/page.tsx:14,150`) use a **$500** free-shipping threshold and a
  flat **$45** shipping charge. This directly contradicts the $50 threshold
  stated on the homepage hero stats, the "Our Standard" section, and the
  footer trust bullets — and it also contradicts the **actual** checkout
  flow, where `SHIPPING_OPTIONS` (`src/lib/checkout/shipping-options.ts`)
  makes Standard Delivery free ($0) unconditionally, with no threshold at
  all, or $12 for Express. **The cart currently tells every customer a
  shipping story that matches neither the marketing copy above it nor the
  checkout flow below it.** With the current $48 test cart, the page reads
  "Shipping $45 — Add $452 more for free shipping," which is wrong on both
  numbers by roughly an order of magnitude.
- Empty-cart copy ("Time to find something beautiful," `cart/page.tsx:23`)
  is the same leftover furniture-store voice as the footer — doesn't match
  "Clever products that solve real household problems" used everywhere
  else.

### Checkout (`/checkout`, `src/components/checkout/*`)

**Strengths:** This is the most rigorously engineered page in the product.
Guest-can-browse/must-identify-to-order (ADR-022), a visual step indicator,
inline sign-in that doesn't break interactivity, atomic order creation with
row-level concurrency locking (ADR-023), a hardened Stripe integration with
card-only PaymentIntents, PaymentIntent reuse and a race guard (ADR-024,
Patch 8.3.2), a webhook ordering guard against out-of-order delivery, and a
live-verified end-to-end payment (`TESTING.md` §5a). No other page in the
product has this level of engineering rigor behind it.

**Weaknesses:** None found that rise above what's already tracked. The
existing, honestly-documented gaps (`TESTING.md` §6): abandoned-checkout
and explicit-cancellation handling (no `payment_intent.canceled`
subscription), and no client-side payment-confirmation timeout. Both are
already correctly scoped to a future sprint rather than hidden.

### Account (`/account/*`, `src/components/account/*`)

**Strengths:** Profile and Address management are real, RLS-scoped, and
well tested (Sprint 7.1). The `nav-items.ts` config already models 10
future categories (Security, Invoices, Home Projects, Service Bookings,
Home Documents, Warranty Files, etc.) as "coming soon," so the account hub
won't need a structural redesign as those ship — a genuinely good piece of
forward architecture.

**Weaknesses:**
- Orders and Wishlist are UI-only placeholders with zero real data wired
  up (`SESSION.md` Known Issues, confirmed still true). Orders is
  particularly notable because real order data *does* exist and *is*
  correctly displayed elsewhere (`/account/orders/[orderNumber]` via
  `OrderSummary`) — the placeholder and the real implementation coexist in
  the same account section without a visible link between them for a
  first-time visitor to discover.
- Unauthenticated visits redirect straight to `/login` with no preview of
  what the account hub offers — reasonable for a protected route, just
  worth noting as a missed light-touch marketing opportunity (e.g., "Sign
  in to track your order" framing) rather than a bug.

### Order Confirmation (`/order-confirmation/[orderNumber]`)

**Strengths:** Shares one `OrderSummary` component with `/account/orders`,
so the data a customer sees immediately after paying is guaranteed
consistent with what they'll see later in their account — a good structural
decision (Sprint 8.0) that prevents a whole class of "my confirmation email
said X but my account says Y" support tickets before it can exist.

**Weaknesses:** None found specific to this page. It inherits whatever
state the order was actually in (correctly), including the still-deferred
order-confirmation-email gap tracked in `docs/ROADMAP.md`'s backlog — not
a defect of this page, a scope item for a future sprint.

---

## 5. UX Pain Points

Ranked by how directly each one blocks or damages a purchase, most severe
first:

1. **Navbar search is completely non-functional.** No submit path exists at
   all. Every visitor who reaches for the header search icon — the single
   most universal ecommerce affordance — hits a dead end.
2. **Homepage "AI Smart Search" doesn't filter anything.** Worse than
   absent, because it actively promises understanding it doesn't deliver.
3. **Cart shipping math contradicts the rest of the site by ~10×** on both
   the threshold ($500 vs $50) and the fee ($45 vs the real $0/$12). This
   sits at the exact moment purchase intent is highest.
4. **"Buy Now" does nothing.** A full-width, primary-styled button with no
   handler is worse than not having the button, because it looks broken
   rather than absent.
5. **FAQ promises a colour choice that doesn't exist in the purchase flow**
   — a specific, avoidable expectation mismatch on the strongest page in
   the product.
6. **Thirteen dead (`href="#"`) links** across the primary nav and footer
   (nav: How It Works, Journal; footer: About Us, Sustainability, Careers,
   Press, FAQ, Shipping & Returns, Care Guide, Contact Us, Privacy Policy,
   Terms of Service; plus a second, separate "Privacy Policy" link in the
   newsletter section's legal text). Individually low severity;
   collectively they signal an unfinished site to anyone who clicks more
   than one. (The hero's own "How It Works" link is a separate,
   lower-severity issue — see §4 Landing: it's mislabeled, not dead.)
7. **Wishlist and Orders sections in `/account` show placeholder UI with no
   real data**, despite real order data existing and being correctly shown
   one click away — a discoverability gap, not a missing feature.

---

## 6. Visual Design Weaknesses

The visual design system itself (`DESIGN_SYSTEM.md`) is unusually
disciplined for a project this size — a real strength, not a weakness, and
worth stating plainly before listing the gaps found against it:

- **Mobile hero: the decorative "N" logo mark overlaps the stats bar.** At
  375×812, the circular "N" badge (bottom-left of the hero) sits directly
  over the "30 / DAY FREE RETURNS" stat cell, fully obscuring the "30" and
  partially obscuring "FREE RETURNS" — confirmed via live screenshot at
  mobile viewport. This is the one place this audit found the design
  system's own mobile rules (§13, 44×44px touch targets, no feature that
  "breaks or disappears on mobile") not fully honored — the stat isn't
  broken functionally, but it's genuinely unreadable at this width.
- **No colour/variant swatches anywhere in the product UI**, despite
  product copy (FAQ) referencing colour choice and `product-content.ts`
  presumably carrying that data — a visual/content mismatch (see §4
  Product) rather than a design-system violation per se.
- **The "Buy Now" and "Add to Cart" buttons are visually equal-weight**
  (`ProductHero.tsx`), which is a real usability smell independent of the
  dead-click bug: two full-width, similarly-styled primary actions compete
  for the same visual priority, when the design system's own button rules
  (§8) say "never use more than one primary CTA per screen section."
- Footer's typographic voice and copy ("a life well lived," "Crafted with
  intention, built to last") reads as a different brand than every other
  page — this is a copy issue with visual consequences (the footer *feels*
  like a different site was pasted in), not a color/spacing/typography
  system violation.

No violations of the hard "Do Not Rules" (§15 of `DESIGN_SYSTEM.md`) were
found elsewhere in this audit — no stray blue accents, no Cormorant body
text, no `asChild` usage, no un-labelled icon-only buttons outside the
issues already named above.

---

## 7. Trust & Conversion Review

Trust signals on this site currently split cleanly into two categories:
**earned** (real, specific, internally consistent) and **inherited**
(leftover template content that actively contradicts the earned signals
next to it).

**Earned trust — genuinely strong:**
- Specific, consistent numbers repeated across contexts without
  contradicting themselves (50k+ homes / 18 countries / 4.9 rating).
- Product-level reviews with a real, non-round rating distribution and
  named, located, "Verified" reviewers with dated purchases and helpful-vote
  counts — reads as authentic, not templated.
- A real 2-year warranty / 30-day returns / free-shipping-over-$50 policy
  stated identically in the hero stats and the "Our Standard" section
  (internally consistent with *each other*, just not with the Cart page —
  see below).
- RLS-first security, no service-role key anywhere, a live-verified Stripe
  integration with a webhook ordering guard and a concurrency race guard —
  invisible to a customer, but the reason none of the trust promises above
  are backed by fragile infrastructure.

**Inherited trust — actively damaging where it appears:**
- **The cart shipping bug (§4) is the single most damaging trust break in
  the product**, because it's not a missing feature (which reads as
  "unfinished") — it's a *number that's actively wrong* on the page where a
  customer is deciding whether to keep going, immediately contradicting a
  promise made in the same session, moments earlier.
- **The browser tab, search-engine snippet, and social-share preview all
  currently say "HomeNest — Luxury Home Furnishings"** and describe
  "Curated furniture and home accessories" (`src/app/layout.tsx:27-36`).
  Anyone who finds the site via a search result or a shared link sees the
  wrong business before they see the homepage at all.
- Thirteen dead links (§5) — a visitor who clicks "Privacy Policy" or "FAQ"
  while deciding whether to trust the site with a payment gets a 404-style
  dead end instead of reassurance.
- The footer's free-shipping claim ("orders over $500") is a *third*,
  independently-wrong version of the same fact the Cart page already gets
  wrong differently — meaning a careful customer who compares the footer to
  the cart to the checkout would see three different numbers for the same
  policy.

**Net assessment:** the earned trust signals are good enough that fixing
the inherited ones is very likely the single highest-leverage thing Sprint
9 can do for conversion — these are not new features, they're removing
self-inflicted contradictions next to content that's already strong.

---

## 8. Mobile Experience

Mobile has been a recurring, explicit verification focus across this
project's history (Sprint 7.1's pill-nav wrap, Sprint 8.1's step-indicator
wrap, both passing) and that discipline shows: nothing this audit checked
at 375×812 broke layout, overflowed horizontally, or lost content.

**What this audit found specifically:**
- The hero, headline, CTA, and stats bar all reflow cleanly to a single
  column at mobile width, with the `clamp()`-based type scale doing its job
  (headline stays legible, no manual breakpoint overrides needed).
- **The one real mobile-specific defect found**: the decorative "N" logo
  mark overlapping the stats bar's bottom row (§6) — this only occurs at
  narrow mobile widths, since the "N" mark presumably sits fixed/absolute
  relative to a taller desktop hero and wasn't re-checked against the
  shorter mobile stats-bar layout.
- Cart, checkout, and account mobile layouts were not re-verified visually
  in this specific audit pass (out of scope for the time available), but
  have each already passed dedicated mobile checks earlier this project
  (Sprint 8.1 step indicator, Sprint 7.1 account nav) with no regressions
  reported since.

**Not evaluated in this pass, worth a follow-up:** actual touch-target
sizing on the product page's quantity stepper and the cart's remove-item
icon buttons — both are small, icon-only controls that weren't measured
against the design system's own 44×44px minimum during this audit.

---

## 9. Accessibility Review

`DESIGN_SYSTEM.md` §14 sets a genuinely rigorous accessibility bar for a
project this size — required `aria-label`s on every icon-only button,
semantic landmark rules, keyboard/Escape handling for overlays, and an
explicit colour-contrast table. Measuring the live site against its own
stated bar:

**Honored, confirmed by source inspection:**
- The search overlay has correct `aria-modal="true" role="dialog"
  aria-label="Search"`, focuses the input on open, and closes on `Escape`
  — everything *except* actually searching (§4) is accessibly built.
- Icon-only buttons checked in this audit (search, cart, mobile menu
  toggle, wishlist heart) all carry `aria-label`s that match the design
  system's examples closely, including the dynamic `"Cart, N items"`
  pattern from Patch 8.2.2's own hydration-safety work.
- Semantic structure (`<section>`, `<nav>`, `<footer>`, heading hierarchy)
  matches the design system's rules on every page sampled.

**Gaps, self-identified by the design system but still open:**
- **Reduced-motion support is explicitly not implemented yet** —
  `DESIGN_SYSTEM.md` §14 marks the `prefers-reduced-motion` CSS block as
  "Future — to be added to globals.css" and this audit confirms it's still
  absent. Given how animation-heavy the homepage is (staggered hero copy,
  Ken Burns zoom, scroll-triggered reveals throughout), this is the most
  consequential accessibility gap in the product for users who've set that
  OS preference.
- Focus-trapping inside overlays is noted in the design system itself as
  "future: implement `focus-trap`" — not yet done, meaning `Tab` can
  currently escape the search overlay and mega menu into the page behind
  them.
- The design system's own contrast table flags `stone-400` on white as
  "⚠️ borderline" and recommends `stone-500` for critical text — this audit
  did not exhaustively check every instance of `stone-400` body/caption
  text sitewide for whether that guidance was actually followed at each
  call site; worth a dedicated pass rather than a spot-check.

**Not a defect, but worth surfacing:** the "Buy Now" dead button (§4, §5)
is also an accessibility issue, not just a functional one — a
screen-reader user hears a button labeled "Buy Now" with no indication it
does nothing, which is a worse experience for assistive-tech users than
sighted users who might eventually notice nothing happened.

---

## 10. Performance Perception

- **A live Next.js dev-mode warning was reproduced during this audit**:
  an Unsplash hero/section image was flagged as the page's Largest
  Contentful Paint element without `loading="eager"`/priority hints for
  its position above the fold. This is a real, actionable Core Web Vitals
  signal, not a cosmetic dev-only notice — LCP is a ranking and perceived-
  speed factor. Worth a focused pass to confirm every above-the-fold
  image on the homepage and product page carries the right priority hints
  (the hero image itself is documented in `DESIGN_SYSTEM.md` as already
  using `priority`/`fetchPriority="high"` — this warning suggests at least
  one *other* section's image is competing for LCP and doesn't have the
  same treatment).
- The homepage is animation-dense (parallax layers, Ken Burns zoom,
  staggered entrances, marquee) — all built on Framer Motion with a
  disciplined, documented easing/duration system (`DESIGN_SYSTEM.md` §11),
  which is the right way to build heavy motion, but the sheer quantity of
  simultaneous scroll-triggered animation on first load is worth a
  perceived-performance pass (does the page *feel* fast before the
  animations finish, not just after).
- Checkout and account pages are correctly server-rendered where dynamic
  (`ƒ` routes) and the product catalogue is statically generated
  (`generateStaticParams`) — this is the right architectural split for
  perceived performance and wasn't found to have regressed anywhere in
  this audit.
- No further performance profiling (bundle size, actual Lighthouse run,
  Core Web Vitals field data) was done in this pass — this section reflects
  what was directly observable via the dev server's own instrumentation,
  not a dedicated performance audit.

---

## 11. Prioritized Improvement Roadmap

Organized by urgency, not by build order — Sprint 9's actual sequencing is
a separate planning step from this document.

**Tier 1 — Trust-damaging, low-effort, fix before anything else:**
1. Cart shipping threshold/fee ($500/$45 → the real $50/checkout-matching
   model).
2. Site-wide title/meta description ("Luxury Home Furnishings" →
   HomeNest's actual positioning).
3. Footer copy, categories, and free-shipping claim (align with the rest
   of the site).
4. "Buy Now" button — either wire it to a real fast-checkout path or
   remove it; a dead primary CTA is worse than no CTA.

**Tier 2 — Functional gaps that undercut a headline feature:**
5. Navbar search — needs an actual submit path at minimum (even a simple
   client-side name/category match would be an improvement over "does
   nothing").
6. Homepage "AI Smart Search" — either make `/products` read and use `q`,
   or reframe the section's promise to match what it currently does
   (navigate to the catalogue), until real AI search (Sprint 9's namesake
   in `docs/ROADMAP.md`) is actually built.
7. Product colour/variant selector — either build it (if `product-content.ts`
   already has the data) or remove the FAQ's colour-choice promise.

**Tier 3 — Finishing work:**
8. The remaining `href="#"` dead links (nav, footer secondary pages) and
   the hero's mislabeled "How It Works" link.
9. Mobile hero logo/stats-bar overlap.
10. Reduced-motion support (`prefers-reduced-motion`).
11. Wishlist/Orders real data in `/account` (larger scope — likely its own
    future sprint, not a quick fix, given it needs real backing tables and
    UI wired to them).

**Tier 4 — Verification debt, not a build item:**
12. A dedicated accessibility pass on `stone-400`-on-white contrast
    instances sitewide.
13. Touch-target sizing check on small icon controls (cart quantity
    stepper, remove-item buttons).
14. A real Lighthouse/Core Web Vitals run, not just the dev-mode LCP
    warning this audit happened to surface.

---

## 12. Quick Wins

Everything in this section is a small, isolated, low-risk change — no
architecture, no schema, no new dependencies — chosen because it's exactly
the kind of fix this project's own culture favors (small, verifiable,
reversible):

- Cart shipping threshold/fee correction (Tier 1 #1).
- Site metadata correction (Tier 1 #2).
- Footer copy/link correction (Tier 1 #3).
- Removing or disabling the "Buy Now" button until it does something
  (Tier 1 #4) — the safe interim move if a real fast-checkout isn't
  in this sprint's scope.
- Fixing or removing the thirteen dead `href="#"` links (Tier 3 #8).
- Mobile hero logo/stats overlap (Tier 3 #9) — almost certainly a single
  z-index/positioning adjustment, not a redesign.
- Removing the FAQ's colour-choice promise if a variant selector isn't
  going to ship this sprint (cheaper than building the selector, and
  removes the mismatch either way).

## 13. High Impact Redesign Opportunities

These are larger than "quick wins" — each genuinely changes a user-facing
capability, not just corrects a mismatch:

- **A real, working search** (navbar and/or homepage) is the single
  highest-leverage opportunity in this audit. The site's entire premise —
  "describe your problem, we'll find the solution" — currently has no
  functional path behind it anywhere. Even a simple client-side
  name/description/category match over the existing 9-product catalogue
  would outperform the current non-functional state enormously, and would
  give real shape to what Sprint 9's actual "AI Smart Search" (per
  `docs/ROADMAP.md`) eventually replaces.
- **Real Orders/Wishlist data in `/account`**, replacing the placeholder
  UI — the backing data and query patterns already exist for Orders (it's
  fully real one click away at `/account/orders/[orderNumber]`); this is
  primarily a wiring and discoverability project, not new architecture.
- **A genuine product variant/colour system**, if the business intends to
  actually sell colour choices (the FAQ content suggests this was the
  intent) — this touches the product data model, cart, and order snapshot,
  so it's correctly a "redesign opportunity" rather than a quick win.
- **A cohesive account-hub onboarding moment** — given `nav-items.ts`
  already models 10 future categories as "coming soon," there's a real
  opportunity to turn the account hub into a visible roadmap for the
  customer relationship (not just a settings page), consistent with the
  long-term AI-native vision in `PROJECT_VISION.md` without building any
  AI now.

---

## 14. Definition of Success for Sprint 9

Sprint 9 should be considered successful if, by its end:

1. **Every number on the Cart page matches the number on the homepage and
   in the real checkout flow** — one shipping story, told consistently,
   everywhere it appears.
2. **The site's title, meta description, and footer describe HomeNest**,
   not a furniture store — verifiable by reading the browser tab, a search
   snippet preview, and the footer in the same sitting and finding them
   consistent with each other and with the homepage hero.
3. **Every visible primary CTA does something** — no dead "Buy Now," no
   dead nav/footer links presented as if they were live (either wired,
   removed, or clearly marked as coming soon rather than a bare `#`).
4. **At least one working search path exists** — a customer who types a
   real query, in the navbar or on the homepage, gets a result that's
   visibly related to what they typed, even if it's not yet AI-powered.
5. **The mobile hero renders with no overlapping content** at the
   375×812 viewport this audit tested.
6. **No new debt was introduced** — every fix should be independently
   verifiable (build passes, live check passes) in the same rigorous,
   evidence-based style already established across every prior sprint in
   this project (`TESTING.md`, `SESSION.md`), not just claimed.

Sprint 9 succeeding does **not** require: a visual redesign of any page
that passed this audit clean (Product, Checkout, Order Confirmation), real
AI-powered search (that's Sprint 9's own future namesake per
`docs/ROADMAP.md`, distinct from "a working search"), or the larger
Wishlist/Orders/variant-system opportunities in §13 — those are correctly
scoped as their own future work, not a precondition for calling this sprint
done.

---

*Document maintained by: Lead Product Designer / Senior Frontend Engineer*
*Source of truth for standards referenced throughout: `PROJECT_VISION.md`,
`DESIGN_SYSTEM.md`*
*Audit performed: 2026-07-19, against the live dev server and current
`main` branch source*
