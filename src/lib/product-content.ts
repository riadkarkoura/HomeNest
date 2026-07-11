// ─── Product Content ─────────────────────────────────────────────────────────
// Enriched demo data for every product.
// When Supabase is connected, replace with a DB query keyed by product slug.
// ─────────────────────────────────────────────────────────────────────────────

export interface Benefit {
  iconName: string; // key in BENEFIT_ICONS map inside BenefitsSection.tsx
  title: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface DemoReview {
  id: string;
  author: string;
  location: string;
  avatar: string; // initials for the avatar circle
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface VideoPlaceholder {
  thumbnailImage: string;
  caption: string;
  duration: string;
}

export interface ProductContent {
  problemHeadline: string;
  problemIntro: string;
  problemPoints: string[];
  solutionHeadline: string;
  solutionBody: string;
  benefits: Benefit[];
  howItWorks: HowItWorksStep[];
  reviews: DemoReview[];
  faqs: FAQ[];
  video: VideoPlaceholder;
}

export const productContent: Record<string, ProductContent> = {
  // ─── 1. Silicone Sink Splash Guard ────────────────────────────────────────
  "silicone-sink-splash-guard": {
    problemHeadline: "Your countertop gets soaked every time someone washes their hands.",
    problemIntro:
      "Most sinks splash water onto the surrounding counter with every use. You wipe it down, it happens again. The wall behind your tap slowly builds up water stains — and nothing you've tried actually stops it.",
    problemPoints: [
      "Water pools on the countertop after every wash",
      "The wall or backsplash behind the tap stays permanently damp",
      "Constant wiping leaves water marks and dulls surfaces",
      "Guests notice the mess before they notice anything else",
    ],
    solutionHeadline: "A simple guard that redirects every drop back where it belongs.",
    solutionBody:
      "The Silicone Sink Splash Guard fits snugly around your faucet base and acts as a barrier between your tap and your countertop. Water that would have splashed outward is redirected back into the sink — silently, automatically, every single time. No more wiping. No more damp walls. Just a dry counter.",
    benefits: [
      {
        iconName: "Shield",
        title: "Food-grade safe",
        description: "Made from BPA-free, food-grade silicone. Safe around food prep and children.",
      },
      {
        iconName: "Zap",
        title: "Installs in seconds",
        description: "No tools, no adhesive. Slips around your faucet base and stays put.",
      },
      {
        iconName: "Droplets",
        title: "Fits any faucet",
        description: "Flexible silicone fits standard faucet bases Ø 18–36 mm without gaps.",
      },
      {
        iconName: "Sparkles",
        title: "Dishwasher safe",
        description: "Throw it in the dishwasher. Heat resistant up to 230°C — built to last.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Slide it around your faucet base",
        description: "The flexible ring opens wide and closes snugly around any standard faucet neck.",
      },
      {
        step: 2,
        title: "Press it flat against the sink deck",
        description: "The flat silicone lip seals against the surface, creating a waterproof barrier.",
      },
      {
        step: 3,
        title: "Use your sink normally",
        description: "Water that would have splashed outward is redirected back into the basin automatically.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Rachel Morrison",
        location: "Austin, TX",
        avatar: "RM",
        rating: 5,
        title: "I've wiped my counter for the last time",
        body: "I genuinely didn't think something this simple would make a difference. I was wrong. My counter has been dry for three weeks straight. I bought two more for the bathroom sinks.",
        date: "12 Jun 2026",
        verified: true,
        helpful: 47,
      },
      {
        id: "r2",
        author: "James Patel",
        location: "London, UK",
        avatar: "JP",
        rating: 5,
        title: "Fits perfectly, looks invisible",
        body: "I chose the stone colour to match my granite and you can barely see it. Works exactly as described. My wall tiles are finally staying dry.",
        date: "4 Jun 2026",
        verified: true,
        helpful: 32,
      },
      {
        id: "r3",
        author: "Yuki Tanaka",
        location: "Vancouver, BC",
        avatar: "YT",
        rating: 4,
        title: "Great product, slightly tricky to seat",
        body: "Took me 30 seconds to figure out the right angle to press it flat. Once seated it doesn't move at all. Very happy with it.",
        date: "28 May 2026",
        verified: true,
        helpful: 18,
      },
    ],
    faqs: [
      {
        question: "Will it fit my faucet?",
        answer:
          "The guard fits any standard faucet base between Ø 18 mm and Ø 36 mm. If your faucet falls in that range — which covers 95% of household faucets — it will fit.",
      },
      {
        question: "Does it need adhesive or tools to install?",
        answer:
          "No adhesive, no tools. It holds itself in place through friction and the natural suction created when pressed flat against the sink deck.",
      },
      {
        question: "How do I clean it?",
        answer:
          "It's fully dishwasher safe. You can also rinse it under hot water and wipe with a cloth. The silicone doesn't absorb stains.",
      },
      {
        question: "Which colour should I choose?",
        answer:
          "We offer white (bright kitchens), stone (granite or stone countertops), and charcoal (dark or matte surfaces). All three are neutral enough to blend into most kitchens.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      caption: "See exactly how it redirects water — in under 15 seconds.",
      duration: "0:14",
    },
  },

  // ─── 2. Bamboo Drawer Organizer Set ───────────────────────────────────────
  "bamboo-drawer-organizer-set": {
    problemHeadline: "Your kitchen drawer is a mess you avoid opening in front of guests.",
    problemIntro:
      "The junk drawer is a universal problem — but it doesn't have to be. When every drawer is chaotic, you waste minutes every day hunting for things you own. A well-organised drawer pays for itself in stress alone.",
    problemPoints: [
      "Cutlery, utensils, and gadgets tumble together in a heap",
      "You waste time hunting for items you know are there",
      "The drawer takes three attempts to close properly",
      "Opening it in front of guests is quietly embarrassing",
    ],
    solutionHeadline: "Six pieces of bamboo that end drawer chaos permanently.",
    solutionBody:
      "The set includes two expandable dividers and four fixed-size trays. You configure them in whatever arrangement fits your drawer — no tools, no adhesive. Made from sustainably harvested natural bamboo with smooth-sanded edges, it looks as good as it works. The expandable dividers grow or shrink with any drawer width.",
    benefits: [
      {
        iconName: "Leaf",
        title: "Sustainably harvested bamboo",
        description: "Bamboo grows back in 3–5 years. Each set uses responsibly sourced material.",
      },
      {
        iconName: "Package",
        title: "6-piece configurable set",
        description: "Two expandable dividers + four fixed trays. Dozens of possible arrangements.",
      },
      {
        iconName: "Ruler",
        title: "Fits any drawer",
        description: "Expandable dividers adjust from 25 cm to 50 cm to fit standard drawer widths.",
      },
      {
        iconName: "Zap",
        title: "Zero installation",
        description: "No tools, no adhesive, no risk to your drawers. Set up in under two minutes.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Measure your drawer",
        description: "Check the interior width. The expandable dividers cover 25–50 cm without gaps.",
      },
      {
        step: 2,
        title: "Choose your layout",
        description: "Arrange the four trays and two dividers to match what you store. Change it anytime.",
      },
      {
        step: 3,
        title: "Load and close",
        description: "Everything in its place. The drawer closes smoothly on the first try, every time.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Sarah Chen",
        location: "San Francisco, CA",
        avatar: "SC",
        rating: 5,
        title: "My kitchen drawers are now something I show off",
        body: "I bought two sets — one for cutlery, one for the utility drawer. Both look incredible and took maybe 90 seconds each to set up. The bamboo feels premium for the price.",
        date: "8 Jun 2026",
        verified: true,
        helpful: 38,
      },
      {
        id: "r2",
        author: "Tom Erikson",
        location: "Stockholm, Sweden",
        avatar: "TE",
        rating: 5,
        title: "Finally got around to it. Worth every penny.",
        body: "I procrastinated on drawer organisation for years. Once I set this up it took less than 10 minutes total. I don't know why I waited so long.",
        date: "2 Jun 2026",
        verified: true,
        helpful: 24,
      },
      {
        id: "r3",
        author: "Amara Osei",
        location: "Accra, Ghana",
        avatar: "AO",
        rating: 4,
        title: "Great product — one tray was slightly warped",
        body: "Four of the five pieces were perfect. One small tray had a slight warp — it still sits flat but noticeable. Customer service sent a replacement without question. Five stars for service.",
        date: "18 May 2026",
        verified: true,
        helpful: 15,
      },
    ],
    faqs: [
      {
        question: "What drawer sizes does this fit?",
        answer:
          "The expandable dividers adjust from 25 cm to 50 cm wide, covering most standard kitchen and bathroom drawer widths. The fixed trays are 12 cm × 8 cm each.",
      },
      {
        question: "Can I use this in a bathroom drawer?",
        answer:
          "Absolutely. The bamboo is sanded smooth and coated with a light finish that protects against light moisture. It works equally well in kitchen and bathroom drawers.",
      },
      {
        question: "Does it scratch the drawer lining?",
        answer:
          "No. All edges are sanded smooth and the base has no rough surfaces. It sits quietly in the drawer without marking the lining.",
      },
      {
        question: "Can I buy extra trays?",
        answer:
          "Yes — individual trays and dividers are sold separately on our products page if you want to expand the system.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
      caption: "Watch a chaotic drawer transform in under 2 minutes.",
      duration: "1:52",
    },
  },

  // ─── 3. Adjustable Shower Caddy ───────────────────────────────────────────
  "adjustable-shower-caddy": {
    problemHeadline: "Shampoo bottles on the shower floor are a safety hazard — and an eyesore.",
    problemIntro:
      "The shower floor is the worst place to store anything. Bottles get in the way, fall over, and create a slip risk. Drilling into tiles to mount a shelf is a commitment most renters can't make — and homeowners don't want to.",
    problemPoints: [
      "Shampoo and conditioner bottles cover the shower floor",
      "Fallen bottles are a genuine slip hazard",
      "You can't drill into rental bathroom tiles",
      "Corner caddies fall off the wall taking your products with them",
    ],
    solutionHeadline: "A tension pole caddy that installs in 3 minutes — no drill, no damage.",
    solutionBody:
      "The adjustable tension pole extends from floor to ceiling and locks in place with a simple twist. Three fully adjustable shelves hold everything from shampoo bottles to loofahs. Made from 304-grade stainless steel with a rust-proof coating, it won't corrode even in a daily steamy shower. Fits ceilings from 180 cm to 280 cm.",
    benefits: [
      {
        iconName: "Wrench",
        title: "Zero drilling required",
        description: "Tension pole anchors floor-to-ceiling without touching a single wall.",
      },
      {
        iconName: "Shield",
        title: "Rust-proof stainless steel",
        description: "304-grade steel with a rust-proof coating handles daily shower steam indefinitely.",
      },
      {
        iconName: "Package",
        title: "Holds up to 15 kg",
        description: "Three adjustable shelves with a combined capacity of 15 kg — more than enough.",
      },
      {
        iconName: "Clock",
        title: "3-minute installation",
        description: "Extend, position, twist the tension knob. No tools, no instructions needed.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Extend the pole to your ceiling height",
        description: "The pole telescopes from 180 cm to 280 cm. Adjust to just under your ceiling height.",
      },
      {
        step: 2,
        title: "Twist the tension knob until firm",
        description: "The tension mechanism grips between floor and ceiling — no movement at all once set.",
      },
      {
        step: 3,
        title: "Position shelves and load up",
        description: "Slide shelves to your preferred heights, clip in the hooks, and fill every shelf.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Lisa Park",
        location: "New York, NY",
        avatar: "LP",
        rating: 5,
        title: "Finally, a solution for renters",
        body: "I've tried suction-cup caddies, corner shelves, over-door hooks. None of them worked long-term. This tension pole has been completely solid for two months. My landlord is thrilled I didn't drill anything.",
        date: "9 Jun 2026",
        verified: true,
        helpful: 61,
      },
      {
        id: "r2",
        author: "Marco Ricci",
        location: "Milan, Italy",
        avatar: "MR",
        rating: 5,
        title: "Fits our sloped ceiling perfectly",
        body: "Our bathroom has a sloped ceiling that made everything else impossible. The adjustable pole handled it without any issue. Very solid construction.",
        date: "1 Jun 2026",
        verified: true,
        helpful: 29,
      },
      {
        id: "r3",
        author: "Fatima Al-Hassan",
        location: "Dubai, UAE",
        avatar: "FA",
        rating: 5,
        title: "Best bathroom purchase this year",
        body: "We have a family of five sharing two bathrooms. This caddy solved our product storage problem instantly. Bought a second one the same week.",
        date: "22 May 2026",
        verified: true,
        helpful: 44,
      },
    ],
    faqs: [
      {
        question: "What ceiling height does it fit?",
        answer:
          "The pole adjusts from 180 cm to 280 cm. This covers virtually all standard ceiling heights. For ceilings outside this range, contact us before ordering.",
      },
      {
        question: "Will it fall over?",
        answer:
          "No. The tension mechanism creates a rigid connection between floor and ceiling. Once set, the pole doesn't budge even when you bump it or load all three shelves.",
      },
      {
        question: "Is it suitable for a walk-in shower without a ceiling?",
        answer:
          "This caddy requires a solid ceiling to anchor against. It won't work in open walk-in showers without a fixed ceiling above the shower area.",
      },
      {
        question: "Does the steel rust in daily shower use?",
        answer:
          "The 304-grade stainless steel with rust-proof coating is designed for permanent wet environments. We've tested it for 18 months of daily shower use with no corrosion.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80",
      caption: "Full installation in 3 minutes — no tools, no damage.",
      duration: "3:04",
    },
  },

  // ─── 4. Magnetic Knife Strip ───────────────────────────────────────────────
  "magnetic-knife-utensil-strip": {
    problemHeadline: "A knife block consumes a third of your counter and collects bacteria.",
    problemIntro:
      "The traditional knife block takes up precious counter real estate, hides which knives you have, and research shows the wooden slots trap moisture and bacteria. There's a better way to store your knives — and it opens up your worktop at the same time.",
    problemPoints: [
      "The knife block takes up a third of usable counter space",
      "Wooden slots trap moisture and bacteria between uses",
      "You can't see all your knives at a glance — you hunt for the right one",
      "Counter clutter makes the whole kitchen feel smaller",
    ],
    solutionHeadline: "Wall-mount your knives. Free your counter. See everything at a glance.",
    solutionBody:
      "The 45 cm acacia wood strip mounts to any wall in minutes using the included hardware. Strong neodymium magnets hold up to 12 knives or metal utensils securely — blades face forward, handles within easy reach, never touching each other. The solid acacia wood is naturally antibacterial, making it a more hygienic storage solution than any knife block.",
    benefits: [
      {
        iconName: "Sparkles",
        title: "Naturally antibacterial",
        description: "Acacia wood is naturally antimicrobial — no trapped moisture, no hidden bacteria.",
      },
      {
        iconName: "Zap",
        title: "Holds up to 12 items",
        description: "Powerful neodymium magnets grip knives, scissors, and metal utensils securely.",
      },
      {
        iconName: "Package",
        title: "Frees your counter completely",
        description: "Every knife goes on the wall. Your counter becomes workspace again.",
      },
      {
        iconName: "Shield",
        title: "Blade-safe grip",
        description: "Magnetic hold is firm enough to hold, gentle enough not to scratch the blade edge.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Choose your wall location",
        description: "Mark the two mounting points using the included template. A stud finder is recommended but not required with the supplied wall anchors.",
      },
      {
        step: 2,
        title: "Mount with the included hardware",
        description: "Two screws, two wall plugs, a screwdriver. Takes about 5 minutes.",
      },
      {
        step: 3,
        title: "Place your knives",
        description: "Lay each blade flat against the strip — the magnets do the work. Reposition at any time.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "David Park",
        location: "Seattle, WA",
        avatar: "DP",
        rating: 5,
        title: "The best upgrade I've made to my kitchen",
        body: "I put off buying one of these for years. The counter space I've got back is remarkable. The acacia looks beautiful, the magnets are genuinely strong, and I can grab any knife in half a second.",
        date: "5 Jun 2026",
        verified: true,
        helpful: 52,
      },
      {
        id: "r2",
        author: "Claire Beaumont",
        location: "Lyon, France",
        avatar: "CB",
        rating: 5,
        title: "Looks even better in person",
        body: "The acacia wood grain is stunning. I put it in my kitchen and three people have asked me where I got it within the same week. Knives stay on firmly — even my heavy German chef's knife.",
        date: "28 May 2026",
        verified: true,
        helpful: 33,
      },
      {
        id: "r3",
        author: "Rohan Mehta",
        location: "Mumbai, India",
        avatar: "RM",
        rating: 4,
        title: "Great — wish it came in 60 cm",
        body: "The 45 cm strip fits 8 of my knives comfortably. I've got a large collection so a few are still in a drawer. If they make a 60 cm version I'll buy it immediately. Quality is excellent.",
        date: "19 May 2026",
        verified: true,
        helpful: 21,
      },
    ],
    faqs: [
      {
        question: "Will it hold my heavy chef's knife?",
        answer:
          "Yes. The neodymium magnets are strong enough to hold knives weighing up to 600 g. Most professional chef's knives weigh 250–350 g, comfortably within range.",
      },
      {
        question: "Does it work with stainless steel and carbon steel?",
        answer:
          "Yes to both. It also works with any ferromagnetic metal — scissors, vegetable peelers, and most metal utensils.",
      },
      {
        question: "Will the magnet scratch my knife blades?",
        answer:
          "The acacia wood surface is smooth and won't scratch blades. The magnetic force is directional — blades rest flat against the wood, not edge-first.",
      },
      {
        question: "Can I mount it on tile?",
        answer:
          "Yes, with tile drill bits (not included). The included hardware is for drywall and plaster. For tile installation, use appropriate tile anchors.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800&q=80",
      caption: "From counter clutter to wall art — in 5 minutes.",
      duration: "4:41",
    },
  },

  // ─── 5. Under-Sink Pull-Out Rack ──────────────────────────────────────────
  "under-sink-pull-out-rack": {
    problemHeadline: "Everything under your sink is a leaning tower you'd rather not disturb.",
    problemIntro:
      "The under-sink cabinet is the most wasted space in any kitchen. Things get pushed to the back and forgotten. When you need them, you have to excavate. It's one of those domestic frustrations you've stopped noticing — until it's solved.",
    problemPoints: [
      "Products pile up and the ones at the back are effectively invisible",
      "You constantly knock things over reaching for what you need",
      "Cleaning products and bottles get dusty at the back",
      "The space feels wasted even though you need all of it",
    ],
    solutionHeadline: "A pull-out rack that makes every inch of under-sink space reachable.",
    solutionBody:
      "The double-tier pull-out rack installs in the under-sink cabinet in under 10 minutes. Full-extension smooth-glide rails let you pull everything forward — nothing sits permanently at the back. Two tiers mean you can organise cleaning products, brushes, sprays, and bottles by type or frequency of use. Adjustable dividers let you make each tier your own.",
    benefits: [
      {
        iconName: "Zap",
        title: "Full-extension rails",
        description: "Smooth-glide rails extend 100% — every item at the very back comes to you.",
      },
      {
        iconName: "Package",
        title: "Fits bottles up to 40 cm tall",
        description: "Both tiers accommodate tall spray bottles, drain cleaners, and under-sink staples.",
      },
      {
        iconName: "Clock",
        title: "Installs in under 10 minutes",
        description: "Two screws per rail with the included hardware. No measuring expertise required.",
      },
      {
        iconName: "Ruler",
        title: "Adjustable width",
        description: "Expands from 40 cm to 55 cm to fit any standard under-sink cabinet width.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Measure your cabinet interior",
        description: "Note the interior width and depth. The rack adjusts from 40–55 cm to fit.",
      },
      {
        step: 2,
        title: "Mount the two glide rails",
        description: "Two screws each side. Use the included self-adhesive template to position them level.",
      },
      {
        step: 3,
        title: "Slide in the basket and load",
        description: "The basket clicks onto the rails. Customise the dividers, then fill it up.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Maria Santos",
        location: "São Paulo, Brazil",
        avatar: "MS",
        rating: 5,
        title: "I found three things I thought I'd lost",
        body: "Installed this on Saturday. Within 10 minutes of organising the under-sink area I found a bottle of drain cleaner and two sponge packs I'd rebought. This rack paid for itself immediately.",
        date: "7 Jun 2026",
        verified: true,
        helpful: 71,
      },
      {
        id: "r2",
        author: "Nina Kovacs",
        location: "Budapest, Hungary",
        avatar: "NK",
        rating: 5,
        title: "Editor's Pick is well-deserved",
        body: "I was sceptical of the Editor's Pick label but it's earned. The build quality on the rails is excellent — no wobble, completely smooth movement. The adjustable dividers are a brilliant touch.",
        date: "30 May 2026",
        verified: true,
        helpful: 39,
      },
      {
        id: "r3",
        author: "James Okafor",
        location: "Lagos, Nigeria",
        avatar: "JO",
        rating: 5,
        title: "Changed how I think about under-sink storage",
        body: "It's hard to explain how much better an organised under-sink cabinet feels until you have one. This rack made it possible in a rental where I can't modify anything.",
        date: "23 May 2026",
        verified: true,
        helpful: 28,
      },
    ],
    faqs: [
      {
        question: "Will it fit my under-sink cabinet?",
        answer:
          "The rack adjusts from 40 cm to 55 cm in width. This covers the majority of standard kitchen sink cabinets. The minimum cabinet depth required is 35 cm.",
      },
      {
        question: "Does it damage the cabinet floor or walls?",
        answer:
          "Only the two rail screws on each side make contact with the cabinet interior. If you remove the rack, you'll have four small screw holes per side.",
      },
      {
        question: "Can I use it with a cabinet that has a pipe in the way?",
        answer:
          "Yes. The rack sits on rails 10 cm above the cabinet floor, leaving clearance for most standard pipe configurations. The adjustable dividers can be positioned around any obstacles.",
      },
      {
        question: "How much weight can each tier hold?",
        answer:
          "Each tier supports up to 8 kg, giving a total capacity of 16 kg across both tiers. More than enough for a fully-loaded under-sink cabinet.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      caption: "Installation to full load in under 10 minutes.",
      duration: "9:22",
    },
  },

  // ─── 6. 360° Rotating Pantry Organizer ────────────────────────────────────
  "rotating-pantry-organizer": {
    problemHeadline: "Half of what's in your pantry is invisible — pushed to the back and forgotten.",
    problemIntro:
      "Cabinet and pantry shelves are fundamentally flawed: everything behind the front row is effectively hidden. You stop buying things you don't use and keep rebying things you already have. A turntable solves this permanently.",
    problemPoints: [
      "Items at the back of the shelf get forgotten completely",
      "You've bought something only to find you already had it",
      "Deep shelves are wasted — most of the space is unreachable",
      "The same three items sit at the front while the rest gather dust",
    ],
    solutionHeadline: "A spin brings everything to the front. Nothing hides anymore.",
    solutionBody:
      "The two-tier 360° turntable puts every item on display. One spin brings anything to the front — no more reaching, no more knocking things over, no more forgotten items. The smooth ball-bearing base holds up to 8 kg and spins silently on any shelf surface. The non-slip coating keeps it anchored even when you pull items off quickly.",
    benefits: [
      {
        iconName: "Zap",
        title: "360° smooth rotation",
        description: "Silent ball-bearing base spins effortlessly under a full 8 kg load.",
      },
      {
        iconName: "Package",
        title: "Two-tier design",
        description: "Upper and lower tiers let you separate categories — spices, sauces, oils.",
      },
      {
        iconName: "Shield",
        title: "Non-slip base",
        description: "A textured non-slip coating keeps the turntable anchored on any shelf surface.",
      },
      {
        iconName: "Sparkles",
        title: "BPA-free and food-safe",
        description: "Made from BPA-free ABS plastic. Wipes clean with a damp cloth in seconds.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Place it on any shelf",
        description: "The non-slip base grips immediately — no installation, no fixing required.",
      },
      {
        step: 2,
        title: "Load both tiers by category",
        description: "Group spices on one tier, sauces on another. Everything in view, nothing hidden.",
      },
      {
        step: 3,
        title: "Spin to access anything",
        description: "One smooth rotation brings any item to the front. Nothing at the back ever again.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Emma Thornton",
        location: "Bristol, UK",
        avatar: "ET",
        rating: 5,
        title: "My spice cupboard is finally under control",
        body: "I have 40+ spices and they were an absolute nightmare to navigate. Two of these turntables later and every single spice is visible and reachable in one spin. Life-changing for cooking.",
        date: "10 Jun 2026",
        verified: true,
        helpful: 55,
      },
      {
        id: "r2",
        author: "Carlos Reyes",
        location: "Mexico City, Mexico",
        avatar: "CR",
        rating: 5,
        title: "Perfect for the fridge too",
        body: "I bought one for the pantry then immediately ordered two more for the fridge shelves. Works just as well on a refrigerator shelf — the sauces and conditioners that used to hide at the back are now always accessible.",
        date: "3 Jun 2026",
        verified: true,
        helpful: 41,
      },
      {
        id: "r3",
        author: "Ingrid Larsen",
        location: "Oslo, Norway",
        avatar: "IL",
        rating: 4,
        title: "Very good — slightly smaller than expected",
        body: "I'd check the 25 cm diameter measurement before buying if you have a narrow shelf. It works perfectly but I was expecting it to be slightly larger. The product itself is excellent quality.",
        date: "25 May 2026",
        verified: true,
        helpful: 19,
      },
    ],
    faqs: [
      {
        question: "What shelf depth do I need?",
        answer:
          "Each tier is 25 cm in diameter. You'll need a shelf at least 27 cm deep to sit the turntable comfortably. Most standard kitchen shelves are 30 cm or deeper.",
      },
      {
        question: "Can I use it in the fridge?",
        answer:
          "Yes. The BPA-free ABS plastic is food-safe and works well in refrigerator temperatures. The non-slip base grips glass refrigerator shelves effectively.",
      },
      {
        question: "Does it separate into two individual tiers?",
        answer:
          "Yes. The upper tier lifts off the lower tier completely. You can use them as two single-layer turntables if preferred.",
      },
      {
        question: "How much weight can it hold?",
        answer:
          "The ball-bearing base supports up to 8 kg total across both tiers. For reference, 8 kg comfortably holds around 12 standard glass spice jars.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      caption: "From hidden chaos to full visibility in 60 seconds.",
      duration: "1:03",
    },
  },

  // ─── 7. Bamboo Bathroom Shelf Tower ───────────────────────────────────────
  "bamboo-bathroom-shelf-tower": {
    problemHeadline: "Small bathrooms have nowhere to put anything — and you're out of floor space.",
    problemIntro:
      "In small bathrooms, every surface is already occupied. The answer isn't a renovation — it's going vertical. The space above your toilet or beside your sink is empty square footage waiting to be used.",
    problemPoints: [
      "Every surface — toilet tank, sink ledge, floor — is already full",
      "Towels, toiletries, and essentials have nowhere logical to live",
      "Drilling into tiles for wall shelves is expensive and permanent",
      "Temporary solutions look cheap and fall apart",
    ],
    solutionHeadline: "Four shelves of vertical storage that stand without drilling a single hole.",
    solutionBody:
      "The bamboo shelf tower is specifically sized to fit over a standard toilet or beside a sink, turning unused vertical space into four full shelves. Made from premium carbonized bamboo with a water-resistant lacquer coating, it handles bathroom humidity without warping or swelling. Assembly takes under 15 minutes with the included allen key. No wall fixings — simply stands in place.",
    benefits: [
      {
        iconName: "Shield",
        title: "Water-resistant lacquer",
        description: "Carbonized bamboo with lacquer coating handles daily bathroom humidity indefinitely.",
      },
      {
        iconName: "Package",
        title: "Four full shelves",
        description: "168 cm tall with four spacious shelves for towels, toiletries, and essentials.",
      },
      {
        iconName: "Wrench",
        title: "15-minute assembly",
        description: "Slot-and-screw construction with an included allen key. No tools required beyond that.",
      },
      {
        iconName: "Leaf",
        title: "Premium carbonized bamboo",
        description: "Carbonized for strength and a rich warm finish that suits any bathroom palette.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Assemble the tower",
        description: "Follow the included diagram — 6 steps, allen key provided, around 15 minutes total.",
      },
      {
        step: 2,
        title: "Position over the toilet or beside the sink",
        description: "The base is sized to straddle a standard toilet tank. Adjust position until stable.",
      },
      {
        step: 3,
        title: "Load from top to bottom",
        description: "Heavier items on lower shelves for stability. Towels and lighter items above.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Keiko Yamamoto",
        location: "Osaka, Japan",
        avatar: "KY",
        rating: 5,
        title: "Transformed a tiny bathroom",
        body: "My bathroom is 3.5 square metres. I had no storage options until this. It fits perfectly over the toilet and holds everything I need. The bamboo colour suits our minimalist tiles beautifully.",
        date: "6 Jun 2026",
        verified: true,
        helpful: 48,
      },
      {
        id: "r2",
        author: "Patrick O'Brien",
        location: "Dublin, Ireland",
        avatar: "PO",
        rating: 5,
        title: "Rock solid and looks premium",
        body: "I was worried about it being tippy but once it's over the toilet it barely moves at all. The bamboo quality is noticeably good — feels and looks like something from a boutique hotel.",
        date: "29 May 2026",
        verified: true,
        helpful: 31,
      },
      {
        id: "r3",
        author: "Zara Ahmed",
        location: "Karachi, Pakistan",
        avatar: "ZA",
        rating: 4,
        title: "Lovely but assembly instructions could be clearer",
        body: "Took me closer to 25 minutes because the diagram at step 4 was a bit ambiguous. Once assembled though, it's genuinely beautiful and very sturdy.",
        date: "20 May 2026",
        verified: true,
        helpful: 16,
      },
    ],
    faqs: [
      {
        question: "Will it fit over my toilet?",
        answer:
          "The tower base is 60 cm wide and designed to straddle most standard toilet tanks. The critical measurement is the distance between the toilet and the nearest wall — you need at least 30 cm of clearance on each side.",
      },
      {
        question: "How stable is it without being anchored to the wall?",
        answer:
          "Very stable when positioned over the toilet tank. The weight of loaded shelves and the fit around the toilet keep it in place. It's not designed to be freestanding in an open space without support.",
      },
      {
        question: "Does the bamboo warp in steam and humidity?",
        answer:
          "The carbonized bamboo and water-resistant lacquer coating protects against bathroom humidity. We recommend not leaving standing water on the shelves, but normal shower steam is not a concern.",
      },
      {
        question: "What weight can each shelf hold?",
        answer:
          "Each shelf supports up to 10 kg. Across four shelves, you have a total capacity of 40 kg — sufficient for towels, toiletries, and bathroom storage by any normal standard.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
      caption: "Assembly to fully loaded in 15 minutes.",
      duration: "14:38",
    },
  },

  // ─── 8. Foldable Storage Cube Set ─────────────────────────────────────────
  "foldable-storage-cube-set": {
    problemHeadline: "Your wardrobe shelves look like someone shook them.",
    problemIntro:
      "Open wardrobe shelves and bookcases become dumping grounds without structure. Clothes get pushed and stacked until they fall. Loose items migrate to the wrong shelf. Foldable cubes impose instant order — and collapse flat when you don't need them.",
    problemPoints: [
      "Wardrobe shelves overflow with uncontained clothing and items",
      "You fold things neatly but they collapse within a day",
      "Under-bed storage is chaotic and inaccessible",
      "Moving house means repacking everything from scratch",
    ],
    solutionHeadline: "Four rigid cubes that create order anywhere — and fold flat when not in use.",
    solutionBody:
      "Each cube pops open from flat in seconds and maintains its shape under load thanks to a rigid wire frame. Reinforced handles make carrying them effortless. A clear label window on the front lets you identify contents without opening each cube. They work on wardrobe shelves, under beds, in bookcases, or stacked on open shelving units.",
    benefits: [
      {
        iconName: "Zap",
        title: "Pops open in seconds",
        description: "Each cube unfolds from flat to rigid in one motion. No assembly, ever.",
      },
      {
        iconName: "Shield",
        title: "Rigid wire frame",
        description: "Steel wire frame maintains shape under load — no sagging, no collapse.",
      },
      {
        iconName: "Package",
        title: "Clear label window",
        description: "See what's inside at a glance. Label windows on every cube, every face.",
      },
      {
        iconName: "Leaf",
        title: "Collapses flat to store",
        description: "When not in use, each cube folds completely flat for effortless storage.",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Pop a cube open from flat",
        description: "Hold two opposite corners and push them toward each other — the cube pops into shape.",
      },
      {
        step: 2,
        title: "Label the front window",
        description: "Slide a handwritten or printed label into the clear front window for instant identification.",
      },
      {
        step: 3,
        title: "Stack, shelf, or slide under the bed",
        description: "Four cubes stack stably or sit side by side on any shelf or flat surface.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Chloe Martin",
        location: "Paris, France",
        avatar: "CM",
        rating: 5,
        title: "My wardrobe finally makes sense",
        body: "I put one cube per clothing category — tops, bottoms, gym, loungewear. Everything folds neatly inside and stays there. The label windows are such a good idea. No more opening every cube to find what I want.",
        date: "8 Jun 2026",
        verified: true,
        helpful: 43,
      },
      {
        id: "r2",
        author: "Liu Wei",
        location: "Shanghai, China",
        avatar: "LW",
        rating: 5,
        title: "Perfect for apartment living",
        body: "In a small apartment you need every storage solution to work. These cubes are solid, look good on open shelving, and when I moved they folded down into almost nothing. Bought a second set.",
        date: "2 Jun 2026",
        verified: true,
        helpful: 34,
      },
      {
        id: "r3",
        author: "Theo Becker",
        location: "Berlin, Germany",
        avatar: "TB",
        rating: 4,
        title: "Good quality — wish they came in more colours",
        body: "The build quality is better than I expected at this price. The wire frame is notably sturdy. I'd give 5 stars if they came in more colours — currently only grey, which is fine but limits styling options.",
        date: "26 May 2026",
        verified: true,
        helpful: 22,
      },
    ],
    faqs: [
      {
        question: "What are the dimensions of each cube?",
        answer:
          "Each cube is 30 cm × 30 cm × 30 cm when open. When collapsed flat, each cube is 30 cm × 30 cm × 2 cm — thin enough to slide behind furniture or into a drawer.",
      },
      {
        question: "How much weight can each cube hold?",
        answer:
          "The steel wire frame supports up to 5 kg per cube. For clothing, linens, and household items, this is more than sufficient. Don't use them for heavy books or tools.",
      },
      {
        question: "Can they be stacked?",
        answer:
          "Yes. The rigid top surface allows stable stacking up to three cubes high. For four or more, we recommend placing them in a fixed unit rather than free-stacking.",
      },
      {
        question: "Are these currently in stock?",
        answer:
          "The Foldable Storage Cube Set is temporarily out of stock due to high demand. You can sign up for a restock notification on this page and we'll email you as soon as they're available.",
      },
    ],
    video: {
      thumbnailImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      caption: "From flat to fully loaded — see how it works.",
      duration: "2:17",
    },
  },
};

export const getProductContent = (slug: string): ProductContent | null =>
  productContent[slug] ?? null;
