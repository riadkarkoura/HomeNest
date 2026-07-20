# HomeNest — Landing Page Experience Redesign

> Sprint 9.3 — HomeNest Experience Transformation (planning phase)
> Architecture and information design only. No code, no page rebuild —
> see §10 for exactly what this document does not do.
> Source of truth: `PROJECT_VISION.md`, `docs/BRAND_FOUNDATION.md`,
> `docs/DESIGN_TOKENS.md`, `docs/COMPONENT_SYSTEM.md`, and
> `docs/UX_AUDIT.md`. Grounded in a direct read of the live homepage
> composition (`src/app/page.tsx`) and its component source, not
> impression.

---

## 1. Purpose

HomeNest's transaction backbone is strong; its front door undersells it.
This document defines how the landing page changes from a catalog-first
storefront with a search feature bolted on, into a guided journey that
leads with understanding a visitor's problem before it ever shows them a
product — while remaining, underneath, the same premium commerce
experience this project has spent eight sprints building correctly.

This is a redesign of **emphasis and sequence**, not a rebuild of the
commerce engine. Checkout, the Order Engine, Stripe, and RLS are entirely
out of scope and untouched by everything below.

## 2. Philosophy Resolution

`PROJECT_VISION.md`'s "What does NOT change" section states the
customer-facing storefront "stays a premium ecommerce experience... What
stops being 'traditional' is *who runs the business behind it*, not what
customers see." This sprint's brief frames HomeNest as "not an ecommerce
website... an intelligent home consultant" — a stronger claim about the
customer experience itself.

**Resolution, confirmed before any of this document was written:**
"AI Home Consultant" is a richer articulation of the *existing*
Problem → Solution → Benefits → Reviews → Purchase journey, not a
replacement of it. The target flow in this sprint's brief still ends in
Checkout — it reorders and reframes the entry point, it doesn't remove
the commerce underneath it. `PROJECT_VISION.md` is not being amended by
this document; everything below is built as an extension of its existing
Problem-first mandate, not a contradiction of it.

## 3. Review of the Existing Landing Page

Current composition, ten sections in order (`src/app/page.tsx`): Hero →
AI Smart Search → Shop by Problem → Marquee (trust ticker) → Philosophy
(animated mission statement) → Category tiles → Featured products → Craft
/ differentiators → Testimonials → Newsletter.

Two load-bearing facts, confirmed by reading the actual source rather
than assumed from a screenshot:

- **The Hero is heavy-dark by deliberate construction, not accident.**
  `HeroSection.tsx` layers a `stone-950` base, a Ken Burns–zoomed dusk
  photograph, and five separate darkening treatments on top of it (a
  bottom vignette, a left-side vignette, a top fade, two radial
  corner-darkening gradients, and a subtle warm bloom). This is a
  genuinely cinematic, noir-leaning treatment — accurately described by
  this sprint's "avoid the heavy dark feeling" note, not a vague
  impression of it.
- **The AI section, as of Sprint 9.1, is an honest keyword-match search
  box, nothing more.** `SmartSearchSection.tsx` takes a typed phrase,
  filters the same nine-product catalogue by keyword, and navigates to
  the filtered product list. There is no restatement of the problem, no
  strategy, no explanation of why a product was recommended. Sprint 9.1
  made this functional (it previously did nothing); this sprint is asking
  for it to *feel like a consultation*, which is a different and larger
  job than the one already done.

## 4. Weak UX Areas

1. **Two disconnected entry points compete for the same job.** The AI
   search box and the "Shop by Problem" category tiles both try to route
   a visitor toward relevant products, but neither leads into the other,
   and neither produces any sense of having been understood.
2. **Trust is front-loaded ahead of the core promise being proven.**
   Stats, a trust marquee, category tiles, a product grid, a craft
   statement, and testimonials all appear before the page has
   demonstrated "we understand your specific problem" even once. For a
   consultant-first brand, credibility should follow a good first
   interaction, not precede it.
3. **Products are shown without the context the brand's own principle
   requires.** Featured/Best Sellers cards show image, name, price, and
   rating — never the problem the product solves, despite every product
   already carrying a `problemSolved` field in the data model that simply
   isn't surfaced on the card today.
4. **There is no "strategy" step anywhere in the product.** Going
   directly from a typed problem to a filtered list skips the entire arc
   this sprint's target flow describes (understand → strategy →
   recommend). That middle step does not exist in any form today.
5. **The Hero's primary action undersells the promise.** "Shop
   Solutions" is a catalog-first call to action; if the consultant is
   meant to be the heart of the experience, the first action a visitor is
   offered should lead there.

## 5. Proposed Information Architecture

| Order | Section | Job | Change from today |
|---|---|---|---|
| 1 | **Hero** | State the problem-solving promise unmistakably; lead with the consultation | Imagery and tone lightened; primary CTA changes (§6) |
| 2 | **AI Home Consultant** | The centerpiece: describe → understand → strategy → recommend | Moved up from position 2-of-10 to immediately after Hero; UX redesigned (§6); visual tone shifts warm/light (§7) |
| 3 | **How It Works** | A short, visual walkthrough of the four-step arc, for visitors who scroll past the consultant without using it yet | New section, replaces Philosophy |
| 4 | **Trust marquee + stats** | Credibility, repositioned after the promise is established | Unchanged content, moved later in sequence |
| 5 | **Shop by Problem** | The deliberate parallel path for visitors who'd rather browse than type | Unchanged |
| 6 | **Recommended Solutions** | Every card carries its problem-solved context | Renamed from Featured/Best Sellers; card content extended (§6) |
| 7 | **Craft / differentiators** | Reinforces trust principles | Unchanged |
| 8 | **Testimonials** | Reinforces trust | Unchanged |
| 9 | **Newsletter** | Closing capture | Unchanged |

**Philosophy section** (the word-by-word animated mission statement) is
proposed for removal as a standalone section. Its content is good but
becomes redundant once "How It Works" exists — folding its spirit into
that new section avoids saying the same thing twice, in two different
registers, on one page.

## 6. Section-by-Section Redesign Intent

*Descriptions of intent and rationale — not markup, not final copy, not
code. A future implementation pass owns the actual build.*

### Hero

Real photography stays, curated toward brighter, sunlit, warm-daylight
imagery (a bright kitchen counter, natural window light) rather than the
current dusk/dim scene. The five-layer dark vignette treatment softens
substantially — enough contrast for legible text, reading as a warm
gradient rather than a near-black cinematic box. The `#hero-3d-canvas`
integration point and its exact id/structure are preserved untouched
regardless of any imagery change — `DESIGN_SYSTEM.md` marks this
permanent, and nothing in this sprint's scope touches it.

**Primary CTA becomes the consultation entry** (confirmed decision):
"Describe your problem" — or equivalent copy, to be finalized in a
copywriting pass — replaces "Shop Solutions" as the Hero's lead action.
"Browse Solutions" remains available as the clearly secondary path, for
visitors who already know what they want and don't need guidance. Both
paths continue to exist; only which one is presented first changes.

Headline copy should name the act of solving a problem more concretely
than the current "Your home, smarter." — final wording is a copywriting
decision, out of this document's scope.

### AI Home Consultant (the core of this sprint)

Three steps to design, all buildable today on Sprint 9.1's existing
keyword-match logic — **no new backend, no AI integration, per explicit
instruction**:

1. **Describe** — the same input mechanism as today, reframed with
   consultation-style copy rather than search-style copy.
2. **Understand** — the submitted text is visibly echoed back, paired
   with a one-line restatement of the problem. This is a real UX moment
   built entirely from the input text itself — no new capability
   required, just a design choice to reflect the visitor's own words back
   to them before anything else happens.
3. **Strategy → Recommend** — a short, honest explanation of the general
   approach, pulled from existing per-category copy already present in
   the product content (not fabricated for this feature), followed by the
   matched products — each explicitly tagged with which part of the
   strategy it addresses.

**A hard constraint, non-negotiable regardless of any other decision in
this document:** copy for this section must never claim understanding or
analysis that isn't actually happening. `docs/BRAND_FOUNDATION.md` §15
names "a brand that promises more than it delivers" as an anti-pattern
this project has already made and fixed once — the original
non-functional AI search this section is descended from. Framing along
the lines of "here's what usually works for this kind of problem" is
honest; framing that implies personalized analysis of *this visitor's
specific home* would not be, until real AI analysis genuinely exists. The
UX is designed so a future real AI backend can slot into these same three
steps without a redesign — but the copy must stay honest about today's
actual capability throughout, not borrow credibility from a future
capability that doesn't exist yet.

### How It Works (new)

A compact, visual four-step walkthrough (Describe → Understand → Strategy
→ Recommend) for visitors who scroll past the consultant without engaging
with it yet — this is what replaces the Philosophy section's job of
establishing trust in the *brand's approach*, but does it by explaining
the mechanism rather than repeating the mission statement in different
words.

### Trust Marquee + Stats, Shop by Problem, Craft, Testimonials, Newsletter

Unchanged in content and purpose — only their position in the page
sequence moves, per §5's table. None of these sections have a defect
this sprint needs to correct.

### Recommended Solutions (renamed from Featured/Best Sellers)

Reuses the existing `ProductCard` component as-is — confirmed sound and
already correctly reused elsewhere per `docs/COMPONENT_SYSTEM.md`'s
audit — with one addition: surface the `problemSolved` field the product
data model already carries but the card doesn't currently display. This
directly satisfies the standing principle that a product must never
appear without the problem it solves.

## 7. Visual Rhythm & Tone Decisions

The homepage's existing light/dark alternation (a mostly light body, with
Hero, the trust marquee, and Craft/Newsletter as dark anchor points) is
sound and is not being reinvented.

**Confirmed decision:** the AI Home Consultant section moves from its
current dark (`stone-950`) treatment to a warm, light treatment. Its
current dark, dramatic styling suits a *feature* well, but works against
"warm and inviting" for what this sprint elevates into the *centerpiece*
of the experience. A section meant to feel like being welcomed and
understood should not visually read as the same register as the hero's
cinematic drama — it should feel like the calm, bright moment after that
drama settles, consistent with `docs/BRAND_FOUNDATION.md`'s "warm, not
cold" visual direction principle.

The resulting rhythm: Hero (warmed, still the darkest/most dramatic
moment on the page) → AI Consultant (light, warm, calm) → How It Works
(light) → trust marquee (brief dark break, functions as a rhythm
punctuation, not a mood shift) → Shop by Problem (light) → Recommended
Solutions (light) → Craft (dark, reinforces gravitas) → Testimonials
(light) → Newsletter (dark, closing bookend).

## 8. Component Reuse & New Component Needs

Per explicit instruction to respect the existing component system
(`docs/COMPONENT_SYSTEM.md`), this redesign should reuse before it
builds:

- **Reused as-is:** `ProductCard`, the Button system's existing roles,
  the still-to-be-adopted Section Header molecule pattern
  `docs/COMPONENT_SYSTEM.md` §4 already identified as the highest-value
  extraction opportunity in the codebase — this redesign is a natural
  place to finally build and adopt it, since every new section needs one.
- **Genuinely new organisms this redesign requires**, to be added to
  `docs/COMPONENT_SYSTEM.md`'s inventory as they're actually built, not
  invented ad hoc: a "Problem Input" molecule (the consultation entry
  field), an "Understanding / Strategy" reveal organism (the echoed-back
  problem plus the strategy explanation), and a "How It Works" step
  walkthrough organism. None of these exist today in any form.
- **Explicitly not needed:** no changes to Checkout, Cart, Account, or any
  commerce-critical component — this redesign's blast radius is the
  homepage only.

## 9. Key Design Decisions & Rationale

A concise summary of every consequential call made in this document and
why, per the explicit "explain every important design decision"
deliverable:

| Decision | Rationale |
|---|---|
| Consultative framing extends, doesn't replace, the ecommerce journey | `PROJECT_VISION.md`'s explicit "what does NOT change" clause; confirmed with you before writing this document (§2) |
| AI Consultant moves to position 2, immediately after Hero | The audit's top finding was that trust and catalog content currently precede the core promise being proven even once (§4.2) |
| Philosophy section removed, folded into new "How It Works" | Avoids restating the same trust-building job twice in different registers on one page (§6) |
| Hero CTA becomes consultation-first, browse becomes secondary | Confirmed with you; the previous catalog-first CTA undersold a consultant-first promise (§4.5, §6) |
| AI section shifts from dark to warm/light | Confirmed with you; a "heart of the brand" section reading as moody/dramatic works against `docs/BRAND_FOUNDATION.md`'s warmth principle (§7) |
| No AI backend built, copy stays deliberately honest about today's capability | Explicit instruction; also a direct application of `docs/BRAND_FOUNDATION.md` §15's own anti-pattern this project has already learned from once (§6) |
| Products gain visible problem-solved context on their cards | Direct requirement from this sprint's stated principle, and a real, previously-unaddressed audit finding (§4.3, §6) |
| Existing `ProductCard`, Button system, and Section Header pattern reused rather than rebuilt | Explicit instruction to respect the existing component system; matches `docs/COMPONENT_SYSTEM.md`'s own recommendations (§8) |
| Checkout, Cart, Account, Order Engine untouched | Explicitly out of scope — this is a landing-page redesign, not a commerce-flow redesign |

## 10. What This Document Does Not Do

This document contains **no code, no component implementation, and no
completed page rebuild**. It defines information architecture, section
intent, and the rationale behind each decision — deliverables 1 through 4
(plus 7) of this sprint's brief. Deliverable 5 ("build the new Landing
Page") has not been started and will not begin until this document is
explicitly approved.

## 11. Next Steps

Once approved, implementation should proceed section by section (Hero
first, then the AI Home Consultant experience, then the new How It Works
section, then the Recommended Solutions card update), each independently
verifiable in the browser before moving to the next — consistent with
this project's established verify-before-proceeding discipline, not as a
single, unreviewable rebuild.

---

*Document maintained by: Lead Product Designer / Senior Frontend Engineer*
*Source of truth: `PROJECT_VISION.md`, `docs/BRAND_FOUNDATION.md`,
`docs/DESIGN_TOKENS.md`, `docs/COMPONENT_SYSTEM.md`,
`docs/UX_AUDIT.md`.*
*Created: 2026-07-19, Sprint 9.3 planning phase*
