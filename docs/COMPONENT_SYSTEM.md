# HomeNest — Component System

> Sprint 9.2 — Brand Identity & Design System (planning phase)
> Architecture only. No code, no page redesigns, no implementation.
> Source of truth: `docs/BRAND_FOUNDATION.md` and `docs/DESIGN_TOKENS.md`.
> Grounded in an audit of the live component library under
> `src/components` (~68 files) as it exists today, not a hypothetical
> ideal — every finding below is a real, verified observation, not a
> guess.

---

# 1. Purpose

A component system is the layer that turns `docs/BRAND_FOUNDATION.md`'s
principles and `docs/DESIGN_TOKENS.md`'s semantic roles into something a
person actually clicks, taps, and reads — the place where strategy and
tokens either show up consistently, or quietly don't.

The audit behind this document found real, concrete evidence of what
happens without one: the same "eyebrow label above a heading" pattern
independently re-implemented in roughly fifteen different files; two
separate, independently-written lightbox implementations for what is
conceptually one gallery interaction; three unrelated loading-skeleton
implementations with no shared primitive between them; a cart line-item
row built twice, once in the cart drawer and once on the cart page, doing
the same job slightly differently; and a handful of icon-only buttons
(cart-item quantity and delete controls) that never received the
accessible label every other icon-only control in the product correctly
has. None of these are bugs in the sense Sprint 9.1 fixed — nothing is
broken — but each is a small, compounding cost of not having a documented
answer to "does a component like this already exist, and where does it
belong?"

This document exists to be that answer. It defines the vocabulary
(§3), audits what exists today against it (§4), and specifies the system
each category of component (§5–§10) should conform to going forward —
so the next component built is reached for from a shared shelf, not
invented fresh because nobody knew where to look.

---

# 2. Design Philosophy

How components should behave, independent of what they render:

- **Composable, not configurable-to-infinity.** A component should do one
  job well and combine with others to do bigger jobs — not grow an
  ever-expanding prop list trying to anticipate every future use. Small,
  well-scoped pieces that compose are easier to trust than one large
  piece with a dozen conditional branches.
- **Predictable.** The same component must behave the same way everywhere
  it's used. A button that means "primary action" in one place and
  "secondary action" in another because its styling was overridden
  per-instance is not predictable — it's a different component wearing
  the same name.
- **Styled only through tokens.** A component never reaches around the
  token system for a one-off value. If a component needs a color, a
  spacing amount, a radius, or a motion duration that no existing token
  provides, that's a gap in the token system (`docs/DESIGN_TOKENS.md`
  §18) to raise — not a reason to hardcode something locally.
- **Accessible by construction, not by review.** Keyboard operability,
  focus visibility, and correct ARIA semantics are properties a component
  is built with, not a checklist applied after it's already shipped.
- **Honest about its own state.** A component that can be empty, loading,
  or in error must treat those as first-class, designed states — not
  something left blank until someone happens to notice and patch it in
  later. The audit found this exact gap three separate times (§9).
- **Motion is a property, not decoration.** How a component enters,
  exits, or responds is part of its definition, resolved from the Motion
  Tokens (`docs/DESIGN_TOKENS.md` §8) — never a bespoke animation invented
  per instance.

---

# 3. Component Architecture

HomeNest's component tree is organized into five tiers, borrowing the
standard atomic-design vocabulary because it maps cleanly onto how the
codebase already tends to be structured — this section defines what each
tier is *responsible for*, not a mandate to rename anything.

- **Atoms** — the smallest indivisible pieces: a button, an input, a
  label, a badge, a single score tile. An atom has no knowledge of the
  page it's used on and carries no business logic — only presentation
  and, where relevant, a single interaction. Today's `src/components/ui/*`
  primitives are the clearest existing example of this tier.
- **Molecules** — a small, fixed group of atoms assembled to do one
  recognizable job: a labeled form field (label + input + error message),
  a product card (image + badge + price + action), an address card (a
  structured read-only display plus its actions). A molecule knows how
  its atoms relate to each other but still has no opinion about the page
  around it.
- **Organisms** — a complete, distinct section of an interface, built from
  molecules and atoms, that could reasonably be described in one sentence
  of what it does: the product detail hero, the cart drawer, the site
  navigation, a checkout section. Organisms may hold local UI state (an
  open/closed toggle, a selected tab) but should not own business logic
  that belongs to the page or a Server Action.
- **Templates** — the layout skeleton of a page, defining where regions
  go without committing to their final content: the checkout page's
  shape (a step indicator, a form column, a summary sidebar), the account
  hub's shape (a header, a tab nav, a content slot), the admin shell's
  shape (sidebar, top bar, main content). A template is reusable across
  more than one real page when the underlying page shape repeats.
- **Pages** — a template filled with real, specific content and wired to
  real data: `/checkout`, `/products/[slug]`, `/account`. This is the
  only tier allowed to know about routing, data fetching, and Server
  Actions directly.

---

# 4. Component Inventory

The audit found no component that needs outright **Replace** or
**Remove** — that's a real, positive finding worth stating plainly, not
an oversight. Every issue found below is a consistency, duplication, or
adoption gap on top of an otherwise sound foundation, not a broken piece
that needs tearing out.

Legend: **Keep** (sound as-is) · **Adopt** (exists and is correct, but is
being bypassed elsewhere in favor of a hand-rolled equivalent) · **Improve**
(exists, has a specific, named gap) · **Merge** (two or more components do
the same job independently and should become one) · **Missing** (a real,
recurring need with no component behind it yet).

## Primitives (`src/components/ui/`)

| Component | Status | Why |
|---|---|---|
| Button | **Improve** | The variant system exists but is overridden with a hardcoded, independently-repeated color choice at nearly every call site — the variant system doesn't yet model HomeNest's actual primary/secondary/danger needs closely enough for people to reach for it instead of writing around it. |
| Badge | **Improve** | Heavily used, but always with enough per-instance override that its own variants are effectively unused — the same signal as Button: the system doesn't yet match real usage (bestseller/new/sale/discount badges). |
| Input, Label, Textarea, Separator, Sheet, Dropdown Menu | **Keep** | Used consistently where they're used, no structural issues found. |
| Select | **Improve** | Exists and works, but is bypassed by a raw native select in more than one form — worth understanding why before assuming the shared one should simply be adopted everywhere. |
| Avatar | **Adopt** | Exists, correct, and unused — at least three separate places hand-roll their own circular-initial avatar markup instead of reaching for this. |
| Card | **Adopt** | Exists, correct, and unused — most surfaces that visually look like "a card" (product cards, address cards, form panels, admin studio sections) hand-roll their own container chrome independently instead. |
| Tooltip | **Adopt** | Exists, fully unused anywhere in the product today. Not a defect — it's ready infrastructure waiting for a real need. |

## Layout (`src/components/layout/`)

| Component | Status | Why |
|---|---|---|
| Navbar | **Improve** | The single largest, most multi-responsibility component in the codebase (logo, nav, mega menu, search, account menu, cart trigger, and mobile panel all in one place), and the one place in the audit where color values bypass the token system with directly-computed, hardcoded values instead of resolving through a Color Role. Both issues are real and worth addressing, but neither is urgent — the component works correctly today. |
| Footer | **Keep** | Sound, token-consistent, correctly scoped after Sprint 9.1's cleanup. |

## Commerce & Product (`src/components/shop/`, `src/components/product/`)

| Component | Status | Why |
|---|---|---|
| Product Card | **Keep** | Genuinely and correctly reused across the homepage, related products, and the catalogue — the model other commerce components should follow. |
| Cart Drawer | **Merge** (with the cart page) | Its empty state and its cart-line-item row are each independently reimplemented, slightly differently, in `src/app/cart/page.tsx` — the same underlying UI built twice by two different code paths. |
| Product Hero | **Merge** (with the sticky buy box) | Its "Add to Cart" button — styling, icon swap, disabled/out-of-stock state — is duplicated independently in the sticky buy box that appears once a visitor scrolls past it. |
| Sticky Buy Box | **Merge** (see Product Hero) | Same finding as above; the underlying need (an add-to-cart action) is one job being done by two independent implementations. |
| Gallery (product hero's gallery+lightbox, and the separate gallery section's own gallery+lightbox) | **Merge** | Two independent lightbox/gallery implementations exist for what is conceptually a single interaction pattern. |
| Related Section | **Keep** | Correctly reuses Product Card rather than reimplementing it — the right pattern. |
| Problem / Solution / Benefits / Reviews / FAQ / Video sections | **Keep** | Genuinely page-specific, single-use narrative sections — no reuse need found, and none should be forced. |

## Checkout (`src/components/checkout/`)

| Component | Status | Why |
|---|---|---|
| Checkout Steps | **Keep** | Correctly scoped, single-purpose, and shaped generically enough to serve a future second multi-step flow without change if one is ever needed. |
| Checkout Client, Identify, Payment, Skeleton | **Keep** | Sound as page-specific orchestration and sub-forms. |
| Checkout Address Picker | **Improve** | Its address-summary display independently reimplements the same read-only address fields the account area's Address Card already renders, in different styling. A documented, deliberate choice at the time it was built, worth revisiting rather than urgent to fix. |

## Account (`src/components/account/`)

| Component | Status | Why |
|---|---|---|
| Account Shell | **Keep** | Correctly scoped shared shell for the whole account hub. |
| Address Card, Address Form | **Keep** | Genuinely and correctly reused (Address Form is shared by both the account area and checkout). |
| Order Summary | **Keep** | Explicitly and correctly shared between order confirmation and account order history — exactly the kind of reuse this system wants to see more of. |
| Profile Form, Coming Soon Grid | **Keep** | Sound, page-specific. |

## Admin (`src/components/admin/`)

| Component | Status | Why |
|---|---|---|
| Admin Shell, Sidebar, Top Bar | **Keep**, with one **Adopt** note | Structurally sound shared shell; both the sidebar and top bar independently hand-roll the same circular-initial avatar markup the unused Avatar primitive already provides. |
| Products Toolbar, Table, Pagination, Actions Menu, View | **Keep** | Correctly scoped to the admin products list; no duplication found among them. |
| Product Studio and its section/atom components (Form Field, Studio Section, Tag Input, Character Counter, Score Card) | **Keep** | This is the strongest example of disciplined internal reuse found anywhere in the audit — every studio section builds from the same small set of shared atoms/molecules instead of reinventing form chrome per section. It's the pattern the rest of the system (especially home/product sections, see below) should be measured against. |

## Homepage Sections (`src/components/home/`)

All ten sections are correctly scoped as page-specific, single-use
organisms — none of them need to become reusable, and none should be
forced into it. **Keep**, with one cross-cutting finding:

- **Missing:** a shared "section header" molecule (an eyebrow label
  immediately followed by a heading, with a consistent entrance
  animation). This exact pattern is independently re-implemented in
  nearly every home section and most product sections — upwards of
  fifteen files, by the audit's count — each writing its own copy of the
  same structure and motion behavior. This is the single highest-value,
  lowest-risk extraction opportunity found in this entire audit: one
  molecule, adopted going forward, removes the largest concentration of
  duplicated markup in the codebase without touching any page's actual
  content or behavior.

---

# 5. Button System

Five semantic roles, plus three states every role must support. These
are descriptions of *purpose*, not a specification of colors or classes.

- **Primary** — the one action a given context most wants a person to
  take. Never more than one Primary per screen context, consistent with
  the existing brand rule.
- **Secondary** — a supporting action that must coexist with a Primary
  without competing with it for attention.
- **Ghost** — the lowest-emphasis actionable role, typically used for
  inline or tertiary actions (a text-style link with an icon, a filter
  toggle) — present, but never mistaken for the main action.
- **Danger** — reserved for destructive or irreversible actions. Must
  resolve through the Error color role (`docs/DESIGN_TOKENS.md` §3), and
  a destructive action should require a confirmation step as part of the
  interaction, not fire immediately on a single click — see §9's note on
  the native browser confirmation dialogs currently used for this, which
  this system should eventually replace with a real, brand-consistent
  confirmation pattern.
- **Icon** — an icon-only variant of any of the roles above. An icon
  button is never exempt from carrying an accessible label — the audit
  found this exact gap in the cart's quantity and delete controls, which
  is precisely the kind of instance this rule exists to prevent recurring.

**Loading.** A button in a loading state must communicate that it's busy
without shifting the surrounding layout, and must not be interactable
again until the operation resolves — a double-submission is a correctness
risk, not just a polish concern.

**Disabled.** A disabled button must remain visually distinguishable from
an active one through more than color alone, and its unavailability must
never be communicated by color alone either (ties to the Accessibility
Tokens' contrast/color-independence rule).

**Accessibility.** Every button must be reachable and operable by
keyboard, must show a visible focus state, and — if icon-only — must
carry an accessible label. No exceptions.

**Usage rules.** A button's role determines its visual weight, not the
page it happens to appear on — a Primary button on the homepage and a
Primary button in checkout should read as the same *kind* of decision,
even though their content differs. Role and resolved styling must always
come from the shared system, never be reconstructed per instance — this
is the specific gap the current Button and Badge primitives have (§4) and
the one this system exists to close going forward.

---

# 6. Input System

Eight roles, covering both text entry and choice:

- **Text** — the general-purpose default for short, single-line input.
- **Search** — visually and behaviorally distinct from Text in that it
  implies an immediate, low-commitment action (searching), not a value
  being saved — should feel lighter-weight than a form field.
- **Email** — Text with the appropriate input mode and validation
  expectations for an email address.
- **Password** — Text with a visibility toggle as a required part of the
  role, not an optional enhancement, consistent with existing product
  behavior.
- **Textarea** — for genuinely multi-line content; should never be used
  where Text would suffice, since it implies more content is expected.
- **Select** — for choosing one value from a bounded, named set of
  options, when there are enough options that Radio would be unwieldy.
- **Checkbox** — for a single independent on/off choice, or multiple
  simultaneous choices from a set.
- **Radio** — for choosing exactly one option from a small, fully visible
  set, when every option should be comparably visible at once (unlike
  Select, which hides the options until opened).

**Validation.** An invalid field must pair a visible, specific message
with the field itself — never rely on a color change alone to
communicate that something is wrong (this is the Accessibility Tokens'
contrast/color-independence principle applied to forms specifically).

**States.** Every input role must support, and look visually distinct in,
at minimum: default, focused, filled, disabled, and invalid. A state that
isn't visually distinct from another isn't actually a supported state —
it's a gap that will surface as user confusion later.

The audit found each of these roles already has a shared primitive
defined, but several are inconsistently bypassed by raw, one-off form
elements in specific places (a checkout checkbox and radio, a homepage
search field, a newsletter field, a sort control, an address form's
choice field). This system's expectation going forward is that every new
text-entry or choice surface resolves to one of the eight roles above
through the shared primitives — not that every existing instance needs
immediate correction.

---

# 7. Navigation Components

- **Navbar** — the primary site header. Exists today as a single,
  large organism (§4's Improve finding) — sound in behavior, but combines
  more responsibility (logo, primary nav, mega menu, search, account
  menu, cart trigger, and the entire mobile navigation experience) than
  a single organism should ideally hold. A future pass should consider
  whether **Mobile Navigation** deserves to be its own organism rather
  than logic embedded inside Navbar — not because anything is currently
  broken, but because a component this size is harder to reason about and
  change safely than several smaller, composed ones.
- **Breadcrumbs** — currently exists only as page-specific inline markup
  on the product detail page. **Missing** as a shared component: any
  future page that would benefit from a breadcrumb trail (a deeper
  catalogue hierarchy, an account sub-section) currently has no shared
  pattern to reach for and would reimplement one from scratch.
- **Footer** — sound, see §4.
- **Pagination** — exists today only for the admin products list. The
  customer-facing product catalogue currently shows every result on one
  page with no pagination at all. This isn't a defect at the catalogue's
  current size, but if the catalogue grows enough to need it, the
  existing admin pagination component should be generalized for shared
  use rather than a second, independent one being built for the
  storefront.

---

# 8. Commerce Components

- **Product Card** — sound, correctly reused (§4).
- **Product Gallery** — two independent implementations exist and should
  become one (§4's Merge finding).
- **Price** — **Missing** as a component. Every surface that displays a
  price (current value, an original/struck-through value, a discount)
  currently reimplements that display independently — the product card,
  the product hero, the cart, and the order summary all do their own
  version of the same formatting logic. Given how central price display
  is to a commerce brand, and how many places already need it, this is
  one of the clearest "Missing" findings in this audit.
- **Rating** — **Missing** as a component, for the same reason as Price:
  star-rating display is independently reimplemented in the product card,
  the product hero, and the reviews section.
- **Stock** — **Missing.** In-stock/out-of-stock messaging currently
  exists only as a conditional string swap inside the Add to Cart button,
  not as its own recognizable piece — worth formalizing if stock-aware
  messaging is ever needed anywhere else (a product card badge, a
  wishlist item, a cart line item that's gone out of stock after being
  added).
- **Add to Cart** — the underlying action is sound and correctly reused
  (Sprint 9.1's Buy Now work confirmed this), but its *button* is
  independently implemented twice (§4's Product Hero / Sticky Buy Box
  finding) and should become one shared component both contexts use.
- **Buy Now** — sound; correctly built on Sprint 9.1's shared cart logic
  rather than a separate implementation.
- **Cart Item** — the line-item row (image, name, quantity control,
  price, remove action) is independently implemented in the cart drawer
  and the cart page for the same underlying data shape — the clearest
  "Merge" candidate in the whole audit alongside the empty-state
  duplication between those same two surfaces.
- **Order Summary** — sound, correctly shared (§4).
- **Checkout Steps** — sound (§4).

---

# 9. Feedback Components

This is the category with the most **Missing** findings in the entire
audit, and the one most worth prioritizing when this system is eventually
implemented:

- **Toast, Alert, Banner** — none of these concepts exist anywhere in the
  product today. Inline, per-form error and success messaging is
  currently handled ad hoc, differently, in each form that needs it.
- **Modal** — a slide-over panel pattern exists and is used correctly for
  cart and address editing, but there is no true centered-dialog pattern
  for the different job a confirmation needs to do. Destructive actions
  (deleting an address, deleting or archiving a product) currently rely
  on the browser's own native confirmation dialog — functional, but
  unstyled, inconsistent with the brand's voice, and a known
  accessibility and consistency compromise worth replacing with a real,
  designed confirmation pattern once this system is implemented.
- **Tooltip** — exists, unused (§4's Adopt finding) — ready for the first
  real need.
- **Empty State** — no shared component exists. At least two, arguably
  three, visually distinct empty-state shapes are independently
  reimplemented across the cart, account orders, account wishlist,
  account addresses, the admin products list, and the products catalogue
  — six or more places solving the same underlying problem
  independently. This is a strong candidate for the same kind of
  consolidation the Section Header molecule (§4) represents.
- **Loading State / Skeleton** — no shared primitive exists. Three
  independent skeleton implementations were found (the checkout page's
  full-page skeleton, the checkout payment step's own inline loading
  block, and the admin products table's own skeleton rows), each written
  separately for the same underlying need: showing a plausible shape of
  content while real data is still arriving.
- **Error State** — currently handled inline, per-instance, wherever an
  operation can fail — no shared pattern exists for "this whole
  section/page failed to load," as distinct from a single form field
  being invalid (which the Input System in §6 already covers).

---

# 10. Layout Components

- **Container** — **Missing.** No shared max-width wrapper exists;
  every section hardcodes its own maximum-width value directly, and the
  audit found this done somewhat inconsistently — most sections agree on
  one width, but a meaningful minority independently chose narrower
  values without an evident reason tied to their content. A shared
  Container, resolving from the Grid Tokens defined in
  `docs/DESIGN_TOKENS.md` §12, would remove this inconsistency at the
  source.
- **Section** — exists only as an *informal*, repeated pattern (the same
  vertical padding and horizontal padding structure copied into nearly
  every page section) rather than a real, shared wrapping component.
  Worth formalizing alongside Container, since the two are closely
  related and the same files that would benefit from one would benefit
  from the other.
- **Grid, Stack, Spacer** — no dedicated components exist for these, and
  that's a reasonable, deliberate state rather than a gap: in a
  utility-class-first system, simple layout arrangement is often better
  left as direct, token-driven utility usage than wrapped in a component
  that adds a layer of indirection for little benefit. This system does
  not currently recommend introducing dedicated Grid/Stack/Spacer
  components — only Container and Section, where real, costly
  duplication was actually found.

---

# 11. Accessibility Requirements

Every component in this system — atom through organism — must satisfy
these before it's considered complete, restating `docs/DESIGN_TOKENS.md`
§15 at the component level:

- **Keyboard.** Every interactive element must be reachable and fully
  operable using only a keyboard, in a logical order.
- **Focus.** Every interactive element must resolve to the shared,
  visible focus token — never suppressed without an equally visible
  replacement defined at the same time.
- **ARIA.** Semantic roles, states, and labels must correctly describe
  what a component is and is doing — especially for icon-only controls,
  where the audit found the pattern generally well-followed (the vast
  majority of icon-only buttons in the product carry a correct label) but
  not universally — the cart's quantity and delete controls being the
  concrete counter-example this requirement exists to close.
- **Touch.** Every interactive element must resolve to the shared minimum
  touch-target size, regardless of how small its visible icon or label
  is.
- **Reduced Motion.** Every component's motion must collapse to its
  defined reduced-motion equivalent (per `docs/DESIGN_TOKENS.md` §8 and
  §15) when a user has requested it — this is a required property of the
  component, not an optional enhancement applied later.

---

# 12. Motion Rules

**How components animate:** every animated property a component uses
must resolve to one of the four Motion Token levels defined in
`docs/DESIGN_TOKENS.md` §8 — Instant for direct feedback to a person's
own action, Fast for small and frequent transitions, Normal for standard
content entrances, Emphasized reserved for rare, significant moments.
Motion should always have a communicative job — confirming a change,
directing attention, or softening a transition — never exist purely for
decoration.

**When components should NOT animate:**

- A component should not animate on every re-render — only on a genuine,
  meaningful state transition a person would actually notice and care
  about.
- Loading and skeleton states should not carry decorative motion that
  competes with their one job of communicating "content is on the way."
- Error states should appear immediately, without an entrance delay — a
  slow-arriving error message is a worse experience than an abrupt one,
  even though abruptness would be wrong for most other content.
- List or grid entrances should stagger only when the list itself is the
  point of attention (a first view of a set of items) — not on routine
  internal updates to a list a person is already looking at.
- Nothing should animate at all, in any of the ways described above, for
  a person who has requested reduced motion — see §11.

---

# 13. Component Lifecycle

**When to create a new component.** A new shared component is justified
when a real, recurring need already exists in two or more places, or when
a single instance is complex enough that isolating it improves
readability and testability on its own merits — not because a need
*might* arise later. Most of this codebase's page-specific sections
(§4's home and product findings) are correctly left un-extracted for
exactly this reason: a one-off doesn't need to become reusable just
because it theoretically could.

**When to extend an existing component.** If a new requirement is a
variation of a role an existing component already serves (a new Button
role, a new Badge meaning), extend that component rather than building a
parallel one — this is the direct antidote to the duplication found
throughout §4.

**When to merge.** When an audit (like this one) finds two or more
independent implementations that are provably doing the same semantic
job — the cart's line-item row and empty state being the clearest
examples found here — those implementations should be consolidated into
one component the existing call sites both adopt. A merge should never
change what either call site's users experience; it should only remove
the duplicated implementation behind them.

---

# 14. Component Evolution Principles

How reusable components should change over time, once they exist:

- **Backward-compatible by default.** A shared component's existing
  behavior should keep working for every current usage when it evolves.
  A breaking change is a deliberate, justified exception — never the
  default path of least resistance.
- **Additive before disruptive.** Prefer adding a new capability (a new
  role, a new supported case) over redefining what an existing one
  means — the same "Token Stability" principle `docs/DESIGN_TOKENS.md`
  §18 establishes for tokens, extended here to components.
- **Deprecation is visible and gradual, never silent.** When a component
  or one of its variants is being phased out, its replacement must exist
  and be adopted first — there should never be a gap where neither the
  old nor the new path is fully available.
- **Evolution follows observed need, not anticipation.** A component
  should change because of a real, current requirement — the same
  "recurring need in two or more places" standard §13 sets for creating
  a component in the first place applies equally to changing one later.
- **The inventory in §4 is a living reference, not a one-time snapshot.**
  A future audit should be able to compare against this document and see
  which flagged gaps were closed and whether any new duplication crept in
  — that comparison is what keeps this system honest over time.

---

# 15. Anti-patterns

Each of these is illustrated with a real example this audit found —
naming the actual instance, not a hypothetical, is what makes this
section useful rather than generic:

- **Duplicated components.** The cart drawer and cart page each
  independently implement the same empty state and the same cart-item
  row; the product hero and sticky buy box each independently implement
  the same add-to-cart button.
- **Component-specific colors.** The site navigation computes and applies
  several color values directly and independently, rather than resolving
  them from the shared Color Role tokens — the exact failure mode
  `docs/DESIGN_TOKENS.md` §19 warns against, found in the single most-
  loaded component in the product.
- **Inline styles.** The same navigation component applies at least one
  interactive element's background, text, and border via directly
  computed inline styling rather than token-resolved classes — bypassing
  the token system entirely for that element, not just choosing the
  wrong token.
- **Mixed responsibilities.** Some of the larger page orchestrators
  (checkout's client component, the product detail client component)
  hold both UI composition and a meaningful amount of business logic in
  the same file. Not necessarily wrong at their current size, but a
  boundary worth watching — if either grows further, the business logic
  should move out before the component becomes hard to reason about.
- **Large monolithic components.** The site navigation is the clearest
  example: one file responsible for the logo, primary navigation, mega
  menu, search, the account menu, the cart trigger, and the entire mobile
  navigation experience. It works correctly today, but its size is itself
  a risk — a change intended for one of those responsibilities is more
  likely to accidentally affect another when they all live in the same
  place.

---

# 16. Governance

- **Review process.** A new shared component should be proposed the same
  way a new design token is (`docs/DESIGN_TOKENS.md` §18) — justified by
  a real, existing need in two or more places, or a genuinely complex
  single instance, per §13's lifecycle rule — not added ad hoc inside
  whichever page happened to need it first.
- **Naming.** A component's name should describe what it *is* or what
  role it plays (a "Section Header," a "Cart Item Row"), never how it's
  implemented or which page introduced it. A name tied to a specific
  page or a specific literal value will mislead the next person who
  finds it used somewhere that name no longer makes sense.
- **Documentation.** Every shared (non-page-specific) component's purpose
  should be evident from its name and its props alone, consistent with
  this codebase's existing low-comment, high-clarity convention — a
  comment should explain *why* a non-obvious decision was made, not
  restate what the code already says.
- **Testing expectations.** This project does not yet have automated
  tests (a known, already-tracked gap — see `SESSION.md`'s Known Issues).
  This system does not change that today, but states the priority for
  when automated testing is introduced: shared, reused components are the
  highest-leverage place to start, since a defect in one of them affects
  every page that depends on it — a defect in a page-specific one-off
  affects only that page.

---

# 17. Definition of Done

This document defines the future component architecture only — it
contains **zero implementation**: no code, no new components have been
built, no existing component has been modified, and no page has been
redesigned. Everything above is inventory, judgment, and system design.

This document succeeds if a future implementation sprint can use §4's
inventory directly as its work list — which components to merge first
(cart item row and empty state; the add-to-cart button; the product
gallery), which genuinely missing pieces to build (Price, Rating, Stock,
the Section Header molecule, Empty State, Loading State, and the
Toast/Alert/confirmation pattern), and which existing primitives to
simply start adopting where they're currently being bypassed (Avatar,
Card, Tooltip, Select) — without needing to re-run this audit or
re-derive any of these judgments from scratch.

This document does **not** define: any component's actual markup,
styling, or code, or any page's visual redesign. §18's Implementation
Priority table offers directional weighting only — a future planning
pass still owns the actual sprint-by-sprint sequencing.

---

# 18. Implementation Priority

Directional weighting only — categorizing *what* matters most, not *how*
or *when* it gets built. A future planning pass owns actual sequencing.

| Priority | Item |
|---|---|
| **High** | Toast / Alert / confirmation pattern (replaces native browser confirm dialogs) |
| **High** | Cart Item row + Empty State consolidation (cart drawer vs. cart page) |
| **High** | Section Header molecule (highest-volume duplication found) |
| **High** | Add to Cart button consolidation (product hero vs. sticky buy box) |
| **Medium** | Price, Rating, and Stock components |
| **Medium** | Loading State / Skeleton consolidation |
| **Medium** | Container and Section layout components |
| **Medium** | Adopting existing Avatar, Card, and Tooltip primitives where currently bypassed |
| **Medium** | Button and Badge variant alignment with real usage |
| **Low** | Product Gallery consolidation |
| **Low** | Breadcrumbs as a shared component |
| **Low** | Storefront pagination (generalizing the existing admin-only component) |
| **Low** | Navbar decomposition (evaluating Mobile Navigation as its own organism) |
| **Low** | Checkout Address Picker / Address Card reconciliation |

---

*Document maintained by: Lead Product Designer / Senior Frontend Engineer*
*Source of truth: `docs/BRAND_FOUNDATION.md` and `docs/DESIGN_TOKENS.md`.
Grounded in a full audit of `src/components` as of this document's
creation.*
*Created: 2026-07-19, Sprint 9.2 planning phase*
