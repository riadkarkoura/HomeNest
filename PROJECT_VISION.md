# HomeNest — Project Vision

> This file is the permanent source of truth for the HomeNest project.
> Read it before every build or modification task.

---

## Mission

HomeNest helps people solve everyday household problems with smart, affordable, and beautifully designed products.

We don't sell products.

We sell solutions.

---

## Long-Term Vision — AI-Native Commerce Operating System

HomeNest is not building toward a traditional ecommerce platform.

The long-term goal is an **AI-native commerce operating system**, where the human owner acts primarily as **Project Manager and final decision maker** — not as the person running day-to-day operations.

Eventually, the owner should only need to:

- Select products
- Approve important AI decisions
- Monitor analytics
- Define business strategy

Everything else — research, execution, optimization — should gradually become AI-driven.

### What this means for how we build

Every future feature must be designed with **AI integration points**, so a specialized AI agent can automate it later without a major architectural rewrite. This does not mean building AI now. It means not building in a way that blocks AI later — for example, favoring a clean server-side entry point a future agent could call over a human-only UI flow with no equivalent path in.

### Future specialized AI agents (architecture target, not a build order)

The platform should eventually support dedicated agents for:

- Product Research
- Product Import
- Product Optimization
- SEO
- Pricing
- Image Generation
- Marketing
- Advertising
- Email Campaigns
- Social Media
- Customer Support
- Inventory
- Analytics
- Operations

### What does NOT change

- The customer-facing storefront stays a premium ecommerce experience (Problem → Solution → Benefits → Reviews → Purchase). What stops being "traditional" is *who runs the business behind it*, not what customers see.
- This is strategic direction, not a sprint. `docs/ROADMAP.md` is unaffected by this vision — no AI sprint is added by it.
- Nothing here authorizes building AI now. Treat it as a lens for design decisions — does this leave room for an agent later? — not a task list.

---

## Brand Personality

- Premium
- Modern
- Minimalist
- Trustworthy
- Helpful
- Warm
- Clean

Inspired by Apple simplicity, IKEA usability, and modern ecommerce experiences.

---

## Target Customers

People who want to improve their homes without spending a fortune.

Especially:

- Families
- Parents
- Busy professionals
- Home organisation lovers

---

## Product Philosophy

Every product must solve a real problem.

Examples of problem areas:

- Water splash
- Kitchen organisation
- Bathroom storage
- Cleaning
- Small spaces
- Daily convenience

Never add a product that doesn't answer:

> "What specific problem does this solve?"

---

## Homepage Philosophy

The homepage must guide visitors toward solving problems — not simply browsing products.

The user journey must follow this exact sequence:

```
Problem
  ↓
Solution
  ↓
Benefits
  ↓
Reviews
  ↓
Purchase
```

Every section on the homepage must serve one of these five stages.

---

## Design Principles

- Minimal
- Elegant
- Premium
- Large white space
- Soft shadows
- Rounded corners (new elements only — do not retrofit existing components)
- Smooth animations
- High performance
- Mobile first
- Accessibility first

---

## UI Rules

- Never overcrowd the interface
- Animations must feel natural, never distracting
- Typography must be clear and legible at all sizes
- Every section must have a clear purpose
- Avoid unnecessary decoration

---

## Technology Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` — no config file)
- shadcn/ui v4 — backed by `@base-ui/react`, NOT Radix UI
  - Use `render` prop pattern, NOT `asChild` (e.g. `<SheetTrigger render={<button />}>`)
- Framer Motion (animations — EASE constant imported from `@/lib/motion`, never redefined)
- Zustand + persist (cart state, localStorage key: `"homenest-cart"`)
- Cormorant Garamond via `next/font/google` → CSS variable `--font-cormorant`
- Unsplash images (whitelisted in next.config.ts)

---

## Future Features (prepare architecture — do NOT implement yet)

| Feature | Notes |
|---|---|
| AI Smart Search | Problem-based product discovery |
| Admin Dashboard | Supabase-backed, stub at `/admin` already exists |
| Stripe | Payment processing |
| PayPal | Alternative payment |
| Supabase | Database + auth backend |
| Product Reviews | `Review` type already stubbed in `src/types/index.ts` |
| Wishlist | `Wishlist` + `WishlistItem` types already stubbed |
| Personalised recommendations | `Recommendation` type already stubbed |
| Multi-language | i18n ready |
| Multi-currency | `Currency` + `PriceLocale` types already stubbed |

Type stubs for all future features live in `src/types/index.ts`.

---

## Development Rules

1. **Never rebuild the project** unless explicitly requested
2. **Always improve existing components** — do not replace unless broken
3. **Reuse components** wherever possible
4. **Keep performance high** — no unnecessary re-renders, no large unoptimised images
5. **Maintain clean architecture** — follow the existing folder structure
6. **Ask before making breaking changes** — explain what will change and why
7. **Explain every change before applying it** for significant modifications
8. **Read this file first** before every task

---

## Current Product Catalog

| # | Product | Category | Price | Badge |
|---|---|---|---|---|
| 1 | Silicone Sink Splash Guard | Kitchen | $24 | Bestseller |
| 2 | Bamboo Drawer Organizer Set | Kitchen | $38 | — |
| 3 | Adjustable Shower Caddy | Bathroom | $34 (was $49) | New |
| 4 | Magnetic Knife & Utensil Strip | Kitchen | $42 | — |
| 5 | Under-Sink Pull-Out Rack | Kitchen | $58 (was $75) | Editor's Pick |
| 6 | 360° Rotating Pantry Organizer | Kitchen | $29 (was $39) | — |
| 7 | Bamboo Bathroom Shelf Tower | Bathroom | $72 | — |
| 8 | Foldable Storage Cube Set (4-pack) | Storage | $48 | — |

---

## Goal

Build one of the best Smart Home Solutions ecommerce experiences on the web.
