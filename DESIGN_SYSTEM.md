# HomeNest — Design System

> Derived from the live codebase on 2026-07-11.
> Every value here is what's actually used — not aspirational.
> Read PROJECT_VISION.md alongside this document.

---

## Table of Contents

1. [Brand Voice](#1-brand-voice)
2. [Colors](#2-colors)
3. [Typography](#3-typography)
4. [Spacing](#4-spacing)
5. [Border Radius](#5-border-radius)
6. [Shadows](#6-shadows)
7. [Icons](#7-icons)
8. [Buttons](#8-buttons)
9. [Cards](#9-cards)
10. [Forms](#10-forms)
11. [Animation Rules](#11-animation-rules)
12. [Component Patterns](#12-component-patterns)
13. [Mobile Rules](#13-mobile-rules)
14. [Accessibility Rules](#14-accessibility-rules)
15. [Do Not Rules](#15-do-not-rules)

---

## 1. Brand Voice

The design system must reflect the brand personality at every level:

| Trait | In UI |
|---|---|
| Premium | Generous white space, restrained use of color, editorial typography |
| Minimal | One action per screen section, no decorative elements without purpose |
| Warm | Amber accent, off-white backgrounds, stone palette — never cold blue or grey |
| Trustworthy | Consistent patterns, clear labels, no dark patterns |
| Helpful | Every section answers a question the user is already asking |

The brand solves problems. The UI should feel like a helpful, knowledgeable friend — not a luxury boutique trying to intimidate you.

---

## 2. Colors

### Foundation

| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| Background | — | `#FAFAF8` | Body background. Warm off-white. Applied as `bg-[#FAFAF8]` |
| Surface | `bg-white` | `#ffffff` | Product cards, form panels, elevated surfaces |
| Surface Subtle | `bg-stone-50` | `#fafaf9` | Alternate section backgrounds, hover states |
| Hero | `bg-stone-950` | `#0c0a09` | Hero section, dark sections (CraftSection, NewsletterSection) |

### Stone Scale (Primary Palette)

Stone is the backbone — a warm, slightly beige gray. Never use neutral or zinc.

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| stone-100 | `stone-100` | `#f5f5f4` | Borders, dividers, product image bg |
| stone-200 | `stone-200` | `#e7e5e4` | Light borders, form outlines |
| stone-300 | `stone-300` | `#d6d3d1` | Disabled states, very subtle borders |
| stone-400 | `stone-400` | `#a8a29e` | Muted text, captions, secondary metadata |
| stone-500 | `stone-500` | `#78716c` | Secondary body text, nav links (scrolled state) |
| stone-600 | `stone-600` | `#57534e` | Icon color (scrolled navbar), medium text |
| stone-700 | `stone-700` | `#44403c` | Form labels |
| stone-800 | `stone-800` | `#292524` | Footer divider bg |
| stone-900 | `stone-900` | `#1c1917` | Footer background, primary button bg, logo (scrolled) |
| stone-950 | `stone-950` | `#0c0a09` | Hero section bg, deepest dark surfaces |

### Amber Scale (Accent / Brand Colour)

Amber is the brand's only accent. Use it intentionally — it must mean something when it appears.

| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| amber-300 | `amber-300` | `#fcd34d` | Italic emphasis on dark backgrounds (newsletter headline) |
| amber-400 | `amber-400` | `#fbbf24` | Stars, icons on dark backgrounds, "Nest" logo on dark |
| amber-500 | `amber-500` | `#f59e0b` | Footer logo "Nest" colour |
| amber-600 | `amber-600` | `#d97706` | **Primary accent** — eyebrow labels, active indicators, links, form accents |
| amber-700 | `amber-700` | `#b45309` | "Nest" logo on light bg, hover on amber-600 actions, add-to-cart text |
| amber-900 | `amber-900` | `#78350f` | Deep hover state on amber-700 |

**Rule:** amber-600 is the default accent. amber-700 is always the hover variant of amber-600.

### Semantic Colours

| Intent | Value | Usage |
|---|---|---|
| Error / Destructive | `oklch(0.577 0.245 27.325)` via `--destructive` | Delete actions, form errors |
| Success | Use amber-600 contextually | Confirmation states (e.g. newsletter submitted checkmark) |
| White on dark | `rgba(255,255,255,0.72)` or `text-white/75` | Nav icons, text on hero |
| Borders on dark | `rgba(255,255,255,0.08)` or `border-white/[0.08]` | Dividers in dark sections |

### Glassmorphism (Navbar)

```css
/* Glass layer when scrolled */
background: rgba(250, 250, 248, 0.88);
backdrop-filter: blur(24px) saturate(180%);
border-bottom: 1px solid rgba(0, 0, 0, 0.06);
box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04);
```

### Selection Colour

```css
::selection { background: oklch(0.55 0.12 60 / 25%); }
```
A subtle amber tint on text selection. Do not change this.

---

## 3. Typography

### Font Stack

| Font | Variable | Weights | Usage |
|---|---|---|---|
| Cormorant Garamond | `--font-cormorant` | 300, 400, 500, 600 (normal + italic) | All display headings, section titles, large editorial text |
| Geist Sans | `--font-geist-sans` | Full range | All body text, UI labels, navigation, buttons |
| Geist Mono | `--font-geist-mono` | Regular | Code, numeric displays (where precision matters) |

**Rule:** Geist Sans is the default for all UI. Cormorant is reserved for headlines that need to feel editorial and premium. Never use Cormorant for body text, buttons, labels, or UI elements.

### Display Classes

Two custom classes define the Cormorant display scale. Use them — never write custom font-family inline for headlines.

```css
/* Hero headline — tightest line-height, most negative tracking */
.display-hero {
  font-family: var(--font-cormorant);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.02em;
}

/* Section headline — relaxed slightly for mid-size usage */
.display-section {
  font-family: var(--font-cormorant);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
```

### Type Scale

| Size | Tailwind | Px | Usage |
|---|---|---|---|
| 2xs | `text-[9px]` | 9px | Scroll indicators, side decorative labels, very small caps |
| xs | `text-[10px]` | 10px | Eyebrow labels (uppercase + tracking), category chips on cards |
| sm-tight | `text-[11px]` | 11px | Star ratings, review counts, cart badge number |
| sm-body | `text-[13px]` | 13px | CTA button text, nav link labels, body copy on cards |
| sm | `text-sm` | 14px | Footer links, form labels, secondary navigation |
| md | `text-[15px]` | 15px | Product names in cards |
| base | `text-base` | 16px | Prices, primary form submit button |
| lg | `text-lg` | 18px | — |
| xl | `text-xl` | 20px | Footer brand name, login logo |
| 2xl | `text-2xl` | 24px | Login page heading |
| 3xl | `text-3xl` | 30px | Products page h1 |
| fluid-sm | `text-[clamp(1.15rem,2.5vw,1.6rem)]` | — | Testimonial quote text |
| fluid-card | `text-[clamp(1.5rem,3vw,2.25rem)]` | — | Category card headlines |
| fluid-section | `text-[clamp(2rem,5vw,3.75rem)]` | — | Standard section headlines (CategorySection, CraftSection, etc.) |
| fluid-philosophy | `text-[clamp(1.75rem,4vw,3.25rem)]` | — | Philosophy section statement |
| fluid-hero | `text-[clamp(3.25rem,8.5vw,8rem)]` | — | Hero h1 only |

### Eyebrow Labels

The eyebrow pattern is used consistently above every section headline.

```tsx
// Standard eyebrow — on light background
<p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3">
  Section Label
</p>

// Eyebrow on dark background
<p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-4">
  Section Label
</p>

// Hero eyebrow (with decorative line)
<div className="flex items-center gap-3 mb-9">
  <span className="block w-5 h-px bg-amber-500/70" />
  <span className="text-[10px] uppercase tracking-[0.35em] text-amber-400/75 font-light">
    Smart Home · Everyday Solutions
  </span>
</div>
```

### Line Heights

| Context | Value |
|---|---|
| Display headlines | `leading-[0.93]` to `leading-none` |
| Body text | `leading-relaxed` (1.625) |
| Tight UI labels | `leading-snug` (1.375) |
| Navigation | implicit (single line) |

### Font Weights

| Weight | Usage |
|---|---|
| 300 (light) | Body text, sub-copy, nav links, `font-light` |
| 400 (regular) | Default, fallback |
| 500 (medium) | Product names in cards, section sub-labels, `font-medium` |
| 600 (semibold) | Prices, bold headline emphasis, `font-semibold` |

---

## 4. Spacing

### Section Rhythm

Every full-width section uses the same vertical padding system.

| Context | Classes | Values |
|---|---|---|
| Standard section | `py-24 sm:py-32` | 96px → 128px |
| Large section | `py-24 sm:py-40` | 96px → 160px |
| Dark feature section | `py-24 sm:py-40` | CraftSection, NewsletterSection |

### Horizontal Padding

| Context | Classes |
|---|---|
| All full-width sections | `px-6 sm:px-8 lg:px-12` |
| Products page | `px-4 sm:px-6 lg:px-8` |
| Navbar inner | `px-6 sm:px-10 lg:px-14` |

### Max Width

```
max-w-7xl mx-auto   →  Standard content container (1280px)
max-w-5xl mx-auto   →  Narrow content (Philosophy, Testimonials)
max-w-3xl mx-auto   →  Quote text
max-w-2xl           →  Hero copy column
max-w-md            →  Form panels (login)
max-w-xs            →  Sub-paragraphs on dark sections
```

### Component Internal Spacing

| Component | Internal spacing |
|---|---|
| Product card content | `p-5` |
| Section header to grid | `mb-14` to `mb-16` |
| Eyebrow to headline | `mb-3` to `mb-4` |
| Headline to sub-copy | `mb-6` to `mb-8` |
| Sub-copy to CTA | `mb-11` |
| Navbar height (top) | `4.5rem` (72px) |
| Navbar height (scrolled) | `3.75rem` (60px) |
| Mega menu padding | `py-10 px-6 sm:px-10 lg:px-14` |
| Hero stats bar cell | `px-6 py-5` |

### Grid Gaps

| Usage | Gap |
|---|---|
| Product grid (homepage) | `gap-px` (hairline, creates grid-line effect) |
| Product grid (products page) | `gap-6` |
| Category grid | `gap-3` |
| Section header actions | `gap-6` |
| Testimonial author | `gap-4` |
| Form fields | `space-y-4` |
| Nav link list | `gap-1` |

---

## 5. Border Radius

The project uses a deliberate two-tier radius system.

### Existing Components (Do Not Change)

Sharp/square edges (`rounded-none`) are used intentionally on elements that existed before the design system:

- Product card (hero section CTA buttons)
- Badges on ProductCard (`rounded-none`)
- Category cards (no border radius on image containers)
- Hero CTA buttons (sharp, editorial)
- Section blocks and dividers

### New Components (Apply Radius)

All new elements built after this design system must use rounded corners per the brand vision.

| Level | Class | px | Use for |
|---|---|---|---|
| Small | `rounded` | 4px | Tags, tiny badges, inline chips |
| Default | `rounded-lg` | 8px | Cards, panels, modal containers |
| Medium | `rounded-xl` | 12px | Image thumbnails, input groups |
| Large | `rounded-2xl` | 16px | Feature cards, hero overlays |
| Full | `rounded-full` | 9999px | Pills, avatar circles, toggle switches, filter tabs |

**Rule:** If unsure, use `rounded-lg`. When in doubt between sharp and rounded for a new element, always choose rounded — it aligns with the brand warmth value.

### CSS Variable

The shadcn base radius is `--radius: 0.625rem` (10px). This feeds the shadcn component system. Do not change it.

---

## 6. Shadows

Shadows are soft and minimal. Never use harsh drop shadows.

| Token | Value | Usage |
|---|---|---|
| Navbar glass | `0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)` | Navbar when scrolled |
| Mega panel | `0 24px 48px -12px rgba(0,0,0,0.14)` | Mega menu dropdown panel |
| Product hover | Replaced by `y: -6px` translate (no shadow) | Product card hover state |
| Subtle elevation | `shadow-sm` (Tailwind) | Form panels, small cards |
| Input focus | `ring-2 ring-amber-500/20` | Form input focus ring |

**Rules:**
- Prefer translate/motion over shadows for hover effects
- Never use `shadow-lg` or larger on surface cards — it feels heavy
- Glassmorphism (`backdrop-blur`) is the primary elevation system for the navbar
- New cards should use `shadow-sm` or `shadow-md` at most

---

## 7. Icons

### Library

Lucide React exclusively. No other icon libraries.

```tsx
import { ShoppingCart, Search, ArrowRight, ArrowUpRight } from "lucide-react";
```

### Icon Sizes

| Context | Class | Px |
|---|---|---|
| Decorative tiny | `h-3 w-3` | 12px — star ratings |
| Small UI | `h-3.5 w-3.5` | 14px — inline with text CTAs, nav chevrons |
| Standard | `h-4 w-4` | 16px — buttons, badges, most UI |
| Medium | `h-[16px] w-[16px]` | 16px — navbar action icons |
| Large | `h-5 w-5` | 20px — search, user icons in overlays |

### Icon Colours

| Context | Colour |
|---|---|
| On white / light bg | `text-stone-400` (muted) or `text-stone-600` (active) |
| Accent action | `text-amber-600` |
| On dark / hero bg | `text-white/40` (muted) or `text-white` (active) |
| Nav icons (transparent state) | `rgba(255,255,255,0.72)` |
| Nav icons (scrolled state) | `#57534e` (stone-600) |

### Icon + Text Patterns

```tsx
// Inline text link with trailing arrow
<Link className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 group">
  View all solutions
  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
</Link>

// Primary button with right arrow
<button className="inline-flex items-center gap-3 ...">
  Shop Solutions
  <ArrowRight className="h-3.5 w-3.5" />
</button>
```

**Rule:** `ArrowRight` for buttons (forward action). `ArrowUpRight` for links that navigate elsewhere or expand. `ChevronDown` for accordion/dropdown triggers. `ChevronRight` for list item navigation.

---

## 8. Buttons

### Variant Map

#### Primary Dark (Default CTA)

Used for the main call-to-action on each page or section.

```tsx
// Sharp-edged variant (existing sections — do not round)
<button className="inline-flex items-center gap-3 bg-stone-950 text-white px-8 py-[14px] text-[13px] font-medium tracking-[0.06em] uppercase">
  Shop Solutions
  <ArrowRight className="h-3.5 w-3.5" />
</button>

// Hover: shimmer sweep effect (hero primary CTA)
// See HeroSection.tsx for full implementation
```

#### Primary White (On Dark Backgrounds)

```tsx
<button className="bg-white text-stone-950 px-8 py-[14px] text-[13px] font-medium tracking-[0.06em] uppercase inline-flex items-center gap-3">
  Shop Solutions
</button>
```

#### Secondary / Ghost

```tsx
// Outline with subtle border — for filter tabs, secondary actions
<button className="px-4 py-2 rounded-full text-sm font-medium bg-white text-stone-600 border border-stone-200 hover:border-stone-400 transition-colors">
  Kitchen
</button>

// Active state of filter tab
<button className="px-4 py-2 rounded-full text-sm font-medium bg-stone-900 text-white">
  All
</button>
```

#### Text / Link Button

```tsx
// Add-to-cart, inline actions
<button className="text-[11px] uppercase tracking-widest text-amber-700 hover:text-amber-900 font-medium transition-colors">
  Add to cart
</button>
```

#### OAuth / Third-party

```tsx
// Using shadcn Button component
<Button variant="outline" className="w-full py-5 gap-3 border-stone-200">
  Continue with Google
</Button>
```

#### Disabled State

```tsx
// Always use opacity-40 + cursor-not-allowed
<button disabled className="... disabled:opacity-40 disabled:cursor-not-allowed">
```

### Button Rules

- Always use `uppercase tracking-[0.06em]` for primary action buttons
- Primary buttons use `px-8 py-[14px]` — taller than standard for presence
- Never use more than one primary CTA per screen section
- Framer Motion: add `whileTap={{ scale: 0.97 }}` to all primary buttons
- Framer Motion: add `whileHover={{ scale: 1.02 }}` only to standalone CTAs (not inline)

---

## 9. Cards

### Product Card

The core commerce unit. Sharp edges, clean, no border.

```
┌────────────────────────┐
│  Image (4:3 ratio)     │  ← bg-stone-100, overflow-hidden
│  [badge]  [quick-add]  │  ← absolute positioned
├────────────────────────┤
│  Category label        │  ← text-[10px] uppercase tracking text-stone-400
│  Product Name          │  ← text-[15px] font-medium text-stone-900
│  Description           │  ← text-[13px] text-stone-400 line-clamp-2
│  ★★★★★ (312)          │  ← h-3 w-3 amber-400 fill
│  ─────────────────     │  ← border-t border-stone-100
│  $24          Add →   │  ← font-semibold | amber-700 text button
└────────────────────────┘
```

**Hover:** `y: -6px` translate via Framer Motion `whileHover`. Image scales `1.05`.
**Background:** `bg-white`
**Border:** none — sits on `bg-stone-100` or `gap-px` grid creating a visual line

### Category Card

Editorial image card with text overlay at the bottom.

```
┌──────────────────────────┐
│                          │
│  Full-bleed image        │
│  + gradient overlay      │
│                          │
│  01  ← index label       │
│  Kitchen                 │  ← display-section, text-white
│  Cook smarter...  ↗      │  ← slides up on hover
└──────────────────────────┘
```

**Hover:** image scales `1.04`. Tagline slides up from `y: 20` to `y: 0`.

### Testimonial (No Card)

Testimonials don't use cards — they float on the section background with generous whitespace. The quote mark is a decorative Cormorant glyph at `text-[8rem]`.

### Mega Menu Category Row

```
┌─────────────────────────────────────┐
│  ○ Kitchen         32 solutions  >  │  ← hover: bg-stone-100/70, text shifts right
│  ○ Bathroom        18 solutions  >  │
│  ○ Storage         24 solutions  >  │
│  ○ Cleaning        12 solutions  >  │
└─────────────────────────────────────┘
```

### Editorial Card (Mega Menu)

Dark image card with copy and CTA overlaid. Always dark background, amber accent, Cormorant headline.

---

## 10. Forms

### Inputs

Built on shadcn `<Input>` component with stone colour overrides.

```tsx
// Standard input
<Input
  id="email"
  type="email"
  placeholder="you@example.com"
  className="mt-1.5"
  autoComplete="email"
/>
```

**Behaviour:** Focus ring uses `ring-amber-500/20` tint (configured via CSS variable `--ring`).
**Border:** `border-stone-200` default, `border-stone-400` on focus.
**Height:** Standard shadcn height (38px). Form submit uses `py-5` for taller presence.

### Search Input (Overlay Style)

```tsx
// Underline only — no box border
<input
  type="search"
  placeholder="Search kitchen, bathroom, storage solutions…"
  className="flex-1 bg-transparent text-white text-[1.35rem] sm:text-2xl font-light placeholder:text-white/22 focus:outline-none"
/>
// Wrap in: border-b border-white/15 pb-4 focus-within:border-white/35 transition-colors
```

### Labels

```tsx
<Label htmlFor="email" className="text-sm font-medium text-stone-700">
  Email Address
</Label>
```

### Checkbox

```tsx
<input
  type="checkbox"
  className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
/>
```

### Password Toggle

Always provide a show/hide toggle on password inputs using `Eye` / `EyeOff` from lucide-react. Position: `absolute right-3 top-1/2 -translate-y-1/2`.

### Newsletter Inline Form

```
┌──────────────────────────┬──────────┐
│  your@email.com          │ Subscribe│  ← border on entire group, not split inputs
└──────────────────────────┴──────────┘
```

The border wraps both input and button together: `border border-white/15 focus-within:border-white/30 transition-colors`.

### Form Rules

- Always use `<Label>` — never a placeholder as the only label
- Always include `autoComplete` attributes
- Error states: use red border + error message below (use `--destructive` colour)
- All forms must have keyboard navigation and visible focus states
- Submit buttons: always use text + `<ArrowRight>` icon on the right

---

## 11. Animation Rules

### The Easing Constant

```ts
// src/lib/motion.ts — always import, never redefine
export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
```

This is ease-out-expo: fast initial movement that decelerates into a smooth rest. It feels premium and purposeful — not bouncy, not linear.

**Rule:** Import `EASE` from `@/lib/motion`. Never write `ease: [0.16, 1, 0.3, 1]` inline in a component.

### Duration Scale

| Type | Duration | Usage |
|---|---|---|
| Micro | `0.2s` | Icon rotation, colour transitions, small state changes |
| Quick | `0.22–0.35s` | Hover reveals, button feedback, accordion open/close |
| Standard | `0.55–0.75s` | Content entrance, panel transitions |
| Cinematic | `0.85–0.95s` | Section entrances, hero copy stagger |
| Slow | `1.1s` | Line reveals (`lineReveal` variant), marquee |
| Ken Burns | `2.6s` | Hero background zoom on load |
| Marquee | `28s` | Infinite horizontal scroll, `linear` easing |

### Viewport Trigger

```ts
// src/lib/motion.ts
export const VIEW_ONCE = { once: true, margin: "-80px 0px" } as const;
// Triggers 80px before the element enters the viewport
// `once: true` — never replays on scroll-back
```

All scroll-triggered animations use `viewport={VIEW_ONCE}` or `whileInView` with `{ once: true, margin: "-80px" }`.

### Stagger System

```ts
// Standard stagger (children enter one after another)
export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// Fast stagger (dense grids, quick reveal)
export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
```

### Standard Variants

```ts
// Import from @/lib/motion

fadeUp    // y: 32 → 0, opacity: 0 → 1, duration 0.9s
fadeIn    // opacity only, duration 0.8s
slideRight // x: -24 → 0, opacity, duration 0.9s
scaleIn   // scale: 0.96 → 1, opacity, duration 0.9s
lineReveal // scaleX: 0 → 1, originX: 0, duration 1.1s
```

### Hero Copy Delay Map

```ts
// Staggered entrance of hero text elements (delays from mount)
const COPY_DELAYS = {
  eyebrow: 0.6,
  h1:      0.75,
  body:    0.95,
  ctas:    1.1,
  stats:   1.25,
};
```

### Spring Animations

| Usage | Config |
|---|---|
| Cart badge entrance | `{ type: "spring", stiffness: 420, damping: 18 }` |
| Mouse parallax | `{ stiffness: 28, damping: 22 }` |

### Mega Menu / Overlay Enter/Exit

```ts
// Panel reveal — clipPath from top
initial: { opacity: 0, clipPath: "inset(0 0 100% 0)" }
animate: { opacity: 1, clipPath: "inset(0 0 0% 0)" }
exit:    { opacity: 0, clipPath: "inset(0 0 100% 0)", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }
// Note: exit easing is ease-in (reversed) — snappy close, smooth open

// Overlay fade
initial: { opacity: 0 }
animate: { opacity: 1 }
exit:    { opacity: 0 }
// duration: 0.25s enter, 0.2s exit
```

### Hover Micro-Interactions

| Element | Interaction |
|---|---|
| Product card | `whileHover={{ y: -6 }}` |
| Product image | `whileHover={{ scale: 1.05 }}` |
| Category card image | `whileHover={{ scale: 1.04 }}` |
| Primary button | `whileTap={{ scale: 0.97 }}` |
| Nav action icons | `whileHover={{ scale: 1.08 }}`, `whileTap={{ scale: 0.94 }}` |
| Text links | CSS `translate-x-0.5 -translate-y-0.5` on icon via `group-hover` |
| Underline reveal | `scaleX: 0 → 1`, `originX: left`, CSS transition |

### Animation Rules (Non-Negotiable)

1. Always import `EASE` — never hardcode the array in a component
2. All scroll-triggered animations use `once: true` — no replay on scroll-back
3. Exit animations must be faster than enter animations (feel responsive)
4. Never animate `height` or `width` directly — use `scaleY`/`clipPath` instead
5. `backdrop-blur` transitions are handled via `opacity` on a child div — not on the element itself
6. Do not put `will-change: transform` on more than one layer in a stacking context

---

## 12. Component Patterns

### Navbar

- Fixed position, `z-50`
- Transparent on hero (top of page), glass when scrolled or menu open
- Height: `4.5rem` transparent → `3.75rem` scrolled
- Logo: Cormorant, "Home" stone + "Nest" amber — color animated with scroll state
- Mega menu triggered by `onMouseEnter` with 150ms close delay (hover intent)
- Mobile: hamburger icon cross-fades between `<Menu>` and `<X>` with rotation
- Uses `usePathname()` to close all overlays on route change
- Body scroll locked when search or mobile menu is open

### Hero Section

- `h-[100svh] min-h-[660px]` — use `svh` (safe viewport height) for mobile
- Three animation layers: scroll parallax (Y%), mouse parallax (X/Y px), Ken Burns zoom
- R3F slot: `id="hero-3d-canvas"` — do not remove
- Stats bar: 4-column grid at the very bottom, inside the hero, with `border-t border-white/[0.08]`
- Scroll indicator: mouse oval `w-[18px] h-[28px]`, bouncing dot inside

### Section Pattern

Every section follows this exact structure:

```tsx
<section ref={ref} className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 bg-[color]">
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
      <div>
        <motion.p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3">
          Eyebrow Label
        </motion.p>
        <motion.h2 className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900">
          Section headline.
        </motion.h2>
      </div>
      <motion.div>
        <Link>View all <ArrowUpRight /></Link>
      </motion.div>
    </div>

    {/* Content */}
    ...

  </div>
</section>
```

### Marquee Strip

- `bg-stone-950 py-4` — dark, compact
- `aria-hidden="true"` — purely decorative
- Items: `text-[11px] uppercase tracking-[0.22em] text-stone-400`
- Separator: `w-1 h-1 rounded-full bg-amber-600` between items
- Animation: `28s linear infinite` via `.animate-marquee` class

### Cart Drawer

- Uses shadcn `<Sheet>` component
- `<SheetTrigger render={<button />}>` — base-ui render prop (not asChild)
- Cart badge: `AnimatePresence` with spring animation
- Width: `w-full sm:max-w-md`

### Testimonials

- `AnimatePresence mode="wait"` for quote transitions
- Dot navigation: active dot widens to `w-6` pill, inactive is `w-1.5 h-1.5` circle
- No card — text floats on `bg-[#FAFAF8]` with centered alignment

### Product Badge

```tsx
// On ProductCard image, top-left
<Badge className="bg-stone-950 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-none">
  −30%
</Badge>

// Future: use product.badge field for type-specific badges
// "Bestseller" | "New" | "Editor's Pick" | "Sale"
```

---

## 13. Mobile Rules

### Breakpoints (Tailwind Defaults)

| Prefix | Min width | Usage |
|---|---|---|
| (none) | 0px | Mobile-first base styles |
| `sm:` | 640px | Tablet adjustments |
| `md:` | 768px | Nav switches from hamburger to desktop links |
| `lg:` | 1024px | Full layout columns, sidebar/grid changes |
| `xl:` | 1280px | Decorative elements (side label, wide grids) |

### Mobile-First Rules

1. Write the mobile style first — then add responsive overrides with `sm:`, `lg:` etc.
2. Never add a feature that works on desktop but breaks or disappears on mobile without a mobile-friendly fallback
3. Hover states must also work as tap states on mobile
4. Touch targets must be minimum `44 × 44px` per WCAG

### Navbar on Mobile

- Desktop nav links hidden below `md:`
- Hamburger button: `h-9 w-9` (36px) — sufficient touch target
- Mobile panel slides down from below the navbar, covers full screen below
- Body scroll locked while open (`overflow: hidden` on `document.body`)
- Close on: route change, ESC key, logo tap

### Hero on Mobile

- Use `h-[100svh]` not `h-screen` — `svh` avoids the iOS browser chrome issue
- Side decorative label hidden on mobile: `hidden xl:flex`
- Stats bar collapses to 2×2 grid: `grid-cols-2 sm:grid-cols-4`

### Product Grid on Mobile

| Breakpoint | Columns |
|---|---|
| Mobile | 1 column |
| Tablet `sm:` | 2 columns |
| Desktop `lg:` | 3 columns |
| Wide `xl:` | 4 columns (products page only) |

### Images on Mobile

- Always use `sizes` attribute: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Hero image: `sizes="100vw"` with `priority` and `fetchPriority="high"`
- Avoid rendering large images off-screen on mobile

### Typography on Mobile

- Use `clamp()` for all headline sizes — they automatically scale down on mobile
- Minimum readable body text: `text-[13px]` (never smaller for content)
- Eyebrow labels at `text-[10px]` are acceptable because they're all-caps + widely tracked

---

## 14. Accessibility Rules

### Focus Visible

All interactive elements must have a visible focus indicator. Default ring from shadcn (`outline-ring/50`) applies globally via:
```css
* { @apply border-border outline-ring/50; }
```
Never use `outline-none` without providing an alternative visible focus state.

### ARIA Labels (Required)

Every icon-only button must have `aria-label`:

```tsx
<button aria-label="Open search">
  <Search className="h-[16px] w-[16px]" />
</button>

<button aria-label={`Cart, ${totalItems} items`}>
  <ShoppingCart className="h-[16px] w-[16px]" />
</button>

<button aria-label="Toggle menu" aria-expanded={mobileOpen}>
  <Menu className="h-5 w-5" />
</button>
```

### ARIA Roles and States

```tsx
// Mega menu trigger
<button aria-haspopup="true" aria-expanded={isActive}>

// Search overlay
<div aria-modal="true" role="dialog" aria-label="Search">

// Decorative elements
<div aria-hidden="true">
  {/* film grain, gradient overlays, side labels, quote marks */}
</div>

// Navigation list
<ul role="list">
```

### Semantic HTML Rules

| Use | For |
|---|---|
| `<section>` | Major page sections (each homepage block) |
| `<nav>` | Navigation (Navbar inner content) |
| `<footer>` | Site footer |
| `<main>` | Page content wrapper (in layout.tsx) |
| `<h1>` | One per page — hero headline or page title |
| `<h2>` | Section headlines |
| `<h3>` | Card titles, sub-section headings |
| `<blockquote>` | Testimonial quotes |
| `<form>` | All forms (even single-field) |
| `<label>` | Always paired with inputs (`htmlFor`) |

### Keyboard Navigation

- All interactive elements reachable by `Tab`
- `Escape` closes: search overlay, mega menu, mobile panel
- Modal/overlay closes on backdrop click AND on Escape
- Focus must be trapped inside active overlays (future: implement `focus-trap`)

### Motion / Reduced Motion

```css
/* Future — to be added to globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
When implementing: use `useReducedMotion()` from Framer Motion and skip entrance animations entirely (not just make them faster).

### Colour Contrast

- Body text on `#FAFAF8`: stone-900 → passes WCAG AA (7:1+)
- Muted text on white: stone-400 `#a8a29e` → ⚠️ borderline on white (use stone-500 for critical text)
- Amber-600 on white: ⚠️ decorative use only (eyebrows, icons) — never primary body text
- White on stone-950: passes AAA
- Minimum contrast for interactive text: 4.5:1 (WCAG AA)

### Alt Text

- Product images: `alt={product.name}`
- Category cards: `alt={category.name}`
- Decorative hero image: `alt=""` (intentionally empty — it's atmosphere)
- Editorial images: descriptive alt text required

---

## 15. Do Not Rules

These are hard stops. No exceptions without a documented reason.

| ❌ Never | ✓ Instead |
|---|---|
| Use `asChild` on shadcn components | Use `render` prop: `<SheetTrigger render={<button />}>` |
| Redefine `EASE` inline | Import from `@/lib/motion` |
| Use `height` or `width` in Framer Motion `animate` | Use `clipPath`, `scaleY`, or `opacity` |
| Add `will-change: transform` to multiple layers in one stack | Limit to one layer per stacking context |
| Use `h-screen` in hero | Use `h-[100svh]` |
| Use neutral/zinc colors anywhere | Use stone palette only |
| Use blue as accent for any purpose | Amber is the only accent colour |
| Use Cormorant for body text, buttons, or UI labels | Cormorant for headlines only |
| Use `font-bold` for section headlines in Cormorant | Cormorant headlines use `font-light` (300) |
| Use `text-xl` or larger for body copy | Cap body copy at `text-[15px]` |
| Hardcode `rgba(0,0,0,0.x)` shadows heavier than `0.14` | Use the approved shadow tokens |
| Add hover animations that animate `left`/`top`/`right`/`bottom` | Use `transform: translate` |
| Add an icon without `aria-label` if it's the only content of a button | Always add `aria-label` |
| Add a new section without an eyebrow label + section headline | Follow the standard section pattern |
| Add a product without a `problemSolved` field | Every product must answer "what problem does this solve?" |
| Remove `id="hero-3d-canvas"` | It is the R3F integration point — permanent |
| Rebuild a working component | Improve it instead |

---

*Last updated: 2026-07-11*
*Maintained by: Lead Product Designer / Senior Frontend Engineer*
*Source of truth: PROJECT_VISION.md + this file*
