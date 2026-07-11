-- ============================================================
-- HomeNest — Seed Data
--
-- Purpose: Populates the database with realistic demo data that
--          mirrors the current frontend (src/lib/products.ts).
--          Run AFTER all 4 migrations have been applied.
--
-- Hardcoded UUIDs let records reference each other without
-- needing RETURNING clauses or temporary variables.
--
-- Includes:
--   • 7 categories
--   • 6 problem tags + synonyms
--   • 8 products (matching src/lib/products.ts exactly)
--   • product ↔ problem tag mappings
--   • 12 settings from DATABASE.md §15
--   • 6 feature flags
-- ============================================================

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO public.categories (id, slug, name, description, icon_name, sort_order, is_active)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'kitchen',
    'Kitchen',
    'Smart solutions for a cleaner, more organised kitchen.',
    'UtensilsCrossed',
    1,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'bathroom',
    'Bathroom',
    'Storage and organisation for small bathroom spaces.',
    'Bath',
    2,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'storage',
    'Storage',
    'Tidy, stackable, and hidden storage for every room.',
    'Archive',
    3,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'cleaning',
    'Cleaning',
    'Products that make cleaning faster and more effective.',
    'Sparkles',
    4,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'bedroom',
    'Bedroom',
    'Organisation and comfort solutions for the bedroom.',
    'Bed',
    5,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'office',
    'Office',
    'Desk, cable, and paper management for home offices.',
    'Briefcase',
    6,
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'outdoor',
    'Outdoor',
    'Garden and outdoor storage solutions.',
    'TreePine',
    7,
    true
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Problem Tags
-- From: ShopByProblemSection (src/components/home/)
-- ============================================================
INSERT INTO public.problem_tags (id, slug, name, description, category_id, icon_name, sort_order, is_active)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'water-splashing',
    'Stop Water Splashing',
    'Water splashing out of the sink onto the counter or wall after every wash.',
    'a0000000-0000-0000-0000-000000000001',
    'Droplets',
    1,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'small-spaces',
    'Organize Small Spaces',
    'Limited space making it impossible to keep things tidy and within reach.',
    'a0000000-0000-0000-0000-000000000002',
    'Minimize2',
    2,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'kitchen-clutter',
    'Declutter Your Kitchen',
    'Crowded counters and chaotic drawers making cooking stressful.',
    'a0000000-0000-0000-0000-000000000001',
    'CookingPot',
    3,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'bathroom-storage',
    'Bathroom Storage',
    'No shelf space for toiletries, towels, and bathroom essentials.',
    'a0000000-0000-0000-0000-000000000002',
    'Bath',
    4,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'cleaning',
    'Cleaning Made Easy',
    'Cleaning products that take too long or don''t reach where you need them.',
    'a0000000-0000-0000-0000-000000000004',
    'Sparkles',
    5,
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'cable-management',
    'Cable Management',
    'Tangled cables and power strips cluttering desks and living areas.',
    'a0000000-0000-0000-0000-000000000006',
    'Cable',
    6,
    true
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Problem Tag Synonyms
-- Natural-language phrases the AI search uses to expand matching.
-- ============================================================
INSERT INTO public.problem_tag_synonyms (problem_tag_id, synonym)
VALUES
  -- water-splashing
  ('c0000000-0000-0000-0000-000000000001', 'water on counter'),
  ('c0000000-0000-0000-0000-000000000001', 'damp worktop'),
  ('c0000000-0000-0000-0000-000000000001', 'sink splashing'),
  ('c0000000-0000-0000-0000-000000000001', 'wet countertop after washing'),
  ('c0000000-0000-0000-0000-000000000001', 'water spray around faucet'),
  -- small-spaces
  ('c0000000-0000-0000-0000-000000000002', 'not enough space'),
  ('c0000000-0000-0000-0000-000000000002', 'tiny apartment storage'),
  ('c0000000-0000-0000-0000-000000000002', 'small bathroom no storage'),
  ('c0000000-0000-0000-0000-000000000002', 'cramped space'),
  -- kitchen-clutter
  ('c0000000-0000-0000-0000-000000000003', 'messy kitchen'),
  ('c0000000-0000-0000-0000-000000000003', 'cluttered counters'),
  ('c0000000-0000-0000-0000-000000000003', 'drawer chaos'),
  ('c0000000-0000-0000-0000-000000000003', 'can''t find anything in kitchen'),
  -- bathroom-storage
  ('c0000000-0000-0000-0000-000000000004', 'no shelf in bathroom'),
  ('c0000000-0000-0000-0000-000000000004', 'shampoo bottles on floor'),
  ('c0000000-0000-0000-0000-000000000004', 'bathroom too small'),
  ('c0000000-0000-0000-0000-000000000004', 'no space for towels'),
  -- cleaning
  ('c0000000-0000-0000-0000-000000000005', 'hard to clean'),
  ('c0000000-0000-0000-0000-000000000005', 'cleaning takes too long'),
  ('c0000000-0000-0000-0000-000000000005', 'can''t reach to clean'),
  -- cable-management
  ('c0000000-0000-0000-0000-000000000006', 'cable mess'),
  ('c0000000-0000-0000-0000-000000000006', 'tangled wires'),
  ('c0000000-0000-0000-0000-000000000006', 'cord clutter'),
  ('c0000000-0000-0000-0000-000000000006', 'messy desk cables')
ON CONFLICT (problem_tag_id, synonym) DO NOTHING;


-- ============================================================
-- Products
-- Matches src/lib/products.ts exactly.
-- published_at is set so products are immediately visible.
-- ============================================================
INSERT INTO public.products (
  id, slug, name, tagline, description, long_description,
  problem_solved, material, dimensions,
  price, original_price, currency,
  category_id, badge,
  rating, review_count,
  in_stock, stock_quantity, featured, is_active,
  tags, published_at
)
VALUES
  -- 1. Silicone Sink Splash Guard
  (
    'b0000000-0000-0000-0000-000000000001',
    'silicone-sink-splash-guard',
    'Silicone Sink Splash Guard',
    'Keep your countertop dry after every wash.',
    'Stops water splash before it reaches your wall or countertop.',
    'Our food-grade silicone splash guard fits snugly around any standard faucet base. It redirects water back into the sink, keeping your countertop and wall dry after every wash. Installs in seconds with no tools and no adhesive. Dishwasher safe and heat resistant up to 230°C. Available in white, stone, and charcoal to match any kitchen.',
    'Eliminates water splash around the sink area',
    'Food-grade silicone',
    'Fits faucet bases Ø 18–36mm',
    24.00, NULL, 'USD',
    'a0000000-0000-0000-0000-000000000001',
    'Bestseller',
    4.80, 312,
    true, 847, true, true,
    ARRAY['sink', 'splash', 'kitchen', 'silicone', 'waterproof'],
    now()
  ),
  -- 2. Bamboo Drawer Organizer Set
  (
    'b0000000-0000-0000-0000-000000000002',
    'bamboo-drawer-organizer-set',
    'Bamboo Drawer Organizer Set',
    'Turn any drawer into a perfectly tidy workspace.',
    '6-piece expandable bamboo set that turns any drawer into a tidy workspace.',
    'This 6-piece bamboo organizer set includes two expandable dividers and four fixed-size trays. Each piece is made from sustainably harvested natural bamboo with smooth-sanded edges. The set fits most standard kitchen and bathroom drawers and can be configured dozens of ways. No tools, no adhesive, no damage to drawers.',
    'Ends the chaos of cluttered kitchen and bathroom drawers',
    'Sustainably harvested natural bamboo',
    'Expandable dividers: 25–50cm width',
    38.00, NULL, 'USD',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    4.70, 187,
    true, 423, true, true,
    ARRAY['drawer', 'organizer', 'bamboo', 'kitchen', 'eco'],
    now()
  ),
  -- 3. Adjustable Shower Caddy
  (
    'b0000000-0000-0000-0000-000000000003',
    'adjustable-shower-caddy',
    'Adjustable Shower Caddy',
    'Three shelves, zero drilling, endless space.',
    'No-drill tension pole caddy with three adjustable shelves.',
    'Install in under 3 minutes — no drilling, no screws, no wall damage. The tension pole extends from floor to ceiling and supports up to 15kg across three fully adjustable shelves. Made from 304-grade stainless steel with a rust-proof coating. Includes razor and loofah hooks on every shelf. Fits ceilings from 180cm to 280cm.',
    'Clears shampoo bottles off the shower floor without drilling',
    '304-grade stainless steel, ABS joints',
    'Extends 180–280cm, shelves Ø 26cm',
    34.00, 49.00, 'USD',
    'a0000000-0000-0000-0000-000000000002',
    'New',
    4.90, 428,
    true, 612, true, true,
    ARRAY['shower', 'caddy', 'bathroom', 'storage', 'no-drill'],
    now()
  ),
  -- 4. Magnetic Knife & Utensil Strip
  (
    'b0000000-0000-0000-0000-000000000004',
    'magnetic-knife-utensil-strip',
    'Magnetic Knife & Utensil Strip',
    'Free your counter. Display your best knives.',
    '45cm acacia wood strip with powerful neodymium magnets.',
    'Our 45cm magnetic strip mounts to any wall in minutes using the included hardware. Strong neodymium magnets hold up to 12 knives or metal utensils securely without scratching blades. The solid acacia wood backing is food-safe, naturally antibacterial, and looks beautiful in any kitchen aesthetic. Works with carbon steel and stainless steel.',
    'Frees counter space occupied by a bulky knife block',
    'Acacia wood, neodymium magnets',
    '45cm × 6cm × 2cm',
    42.00, NULL, 'USD',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    4.80, 156,
    true, 294, true, true,
    ARRAY['knife', 'magnetic', 'kitchen', 'wall mount', 'organization'],
    now()
  ),
  -- 5. Under-Sink Pull-Out Rack
  (
    'b0000000-0000-0000-0000-000000000005',
    'under-sink-pull-out-rack',
    'Under-Sink Pull-Out Rack',
    'The wasted cabinet under your sink — solved.',
    'Double-tier sliding rack that makes full use of your under-sink cabinet.',
    'The under-sink area is prime real estate wasted in most homes. Our double-tier pull-out rack installs in under 10 minutes using the included hardware. Full-extension smooth-glide rails let you reach items at the very back. Holds cleaning products, brushes, and bottles up to 40cm tall. Adjustable dividers let you customize each tier for your exact products.',
    'Turns a chaotic under-sink cabinet into organized, reachable storage',
    'Powder-coated steel, chrome rails',
    '50cm × 30cm × 35cm (adjustable width)',
    58.00, 75.00, 'USD',
    'a0000000-0000-0000-0000-000000000001',
    'Editor''s Pick',
    4.90, 203,
    true, 178, true, true,
    ARRAY['under sink', 'cabinet', 'kitchen', 'sliding rack', 'organization'],
    now()
  ),
  -- 6. 360° Rotating Pantry Organizer
  (
    'b0000000-0000-0000-0000-000000000006',
    'rotating-pantry-organizer',
    '360° Rotating Pantry Organizer',
    'Everything in view. Nothing forgotten.',
    'Two-tier lazy susan that brings everything to the front with a single spin.',
    'How many times have you bought something only to find you already had one hidden at the back? Our two-tier 360° turntable puts everything on display. Use it in pantry cabinets, refrigerators, or bathroom medicine cupboards. The smooth ball-bearing base spins quietly and holds up to 8kg. A non-slip coating on the base keeps it anchored on any shelf.',
    'Stops items getting lost behind other things on pantry and cabinet shelves',
    'BPA-free ABS, steel ball bearing',
    'Ø 25cm per tier, 23cm total height',
    29.00, 39.00, 'USD',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    4.70, 341,
    true, 521, true, true,
    ARRAY['lazy susan', 'turntable', 'pantry', 'kitchen', 'bathroom', 'rotating'],
    now()
  ),
  -- 7. Bamboo Bathroom Shelf Tower
  (
    'b0000000-0000-0000-0000-000000000007',
    'bamboo-bathroom-shelf-tower',
    'Bamboo Bathroom Shelf Tower',
    'Four shelves of breathing room above your toilet.',
    'Free-standing 4-shelf bamboo tower — fits over any standard toilet.',
    'Specifically designed to reclaim the dead space above your toilet or beside your sink. Four spacious shelves hold towels, toiletries, and bathroom essentials. Made from premium carbonized bamboo with a water-resistant lacquer coating. Assembly takes under 15 minutes with the included allen key. Requires no wall fixings — simply stands in place.',
    'Creates bathroom storage in small spaces with no drilling or wall damage',
    'Carbonized bamboo, water-resistant lacquer',
    '60cm × 28cm × 168cm',
    72.00, NULL, 'USD',
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    4.60, 94,
    true, 89, false, true,
    ARRAY['bathroom', 'shelf', 'bamboo', 'storage', 'over toilet', 'free-standing'],
    now()
  ),
  -- 8. Foldable Storage Cube Set
  (
    'b0000000-0000-0000-0000-000000000008',
    'foldable-storage-cube-set',
    'Foldable Storage Cube Set (4-pack)',
    'Stack it. Fold it. Store it. Repeat.',
    '4 collapsible fabric cubes with label windows — stack, fold, store.',
    'Each cube collapses flat in seconds when not in use and pops open firmly for everyday use. A rigid wire frame keeps each cube''s shape under load. Reinforced top handles make moving them effortless. Clear label windows on the front let you identify contents without opening the cube. Works on wardrobe shelves, under beds, in bookcases, or on open storage units.',
    'Tames cluttered wardrobes and shelves with neat, stackable storage',
    'Non-woven polypropylene, steel wire frame',
    '30cm × 30cm × 30cm per cube',
    48.00, NULL, 'USD',
    'a0000000-0000-0000-0000-000000000003',
    NULL,
    4.50, 267,
    false, 0, false, true,
    ARRAY['storage', 'cubes', 'closet', 'foldable', 'wardrobe', 'organization'],
    now()
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Product ↔ Problem Tag Mappings
-- relevance_score: 1.0 = primary solution, 0.7 = secondary
-- ============================================================
INSERT INTO public.product_problem_tags (product_id, problem_tag_id, relevance_score)
VALUES
  -- Silicone Sink Splash Guard → water-splashing (primary)
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1.00),
  -- Silicone Sink Splash Guard → kitchen-clutter (secondary)
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 0.60),

  -- Bamboo Drawer Organizer Set → kitchen-clutter (primary)
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 1.00),
  -- Bamboo Drawer Organizer Set → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 0.70),

  -- Adjustable Shower Caddy → bathroom-storage (primary)
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 1.00),
  -- Adjustable Shower Caddy → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 0.80),

  -- Magnetic Knife & Utensil Strip → kitchen-clutter (primary)
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 1.00),
  -- Magnetic Knife & Utensil Strip → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 0.65),

  -- Under-Sink Pull-Out Rack → kitchen-clutter (primary)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 1.00),
  -- Under-Sink Pull-Out Rack → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 0.75),
  -- Under-Sink Pull-Out Rack → cleaning (tertiary — holds cleaning products)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 0.50),

  -- 360° Rotating Pantry Organizer → kitchen-clutter (primary)
  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 1.00),
  -- 360° Rotating Pantry Organizer → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 0.70),

  -- Bamboo Bathroom Shelf Tower → bathroom-storage (primary)
  ('b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 1.00),
  -- Bamboo Bathroom Shelf Tower → small-spaces (secondary)
  ('b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 0.85),

  -- Foldable Storage Cube Set → small-spaces (primary)
  ('b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 1.00)
ON CONFLICT (product_id, problem_tag_id) DO NOTHING;


-- ============================================================
-- Settings
-- From DATABASE.md §15 seed values.
-- ============================================================
INSERT INTO public.settings (key, value, description, is_public, "group")
VALUES
  ('store.name',                    '"HomeNest"',          'Brand name shown in UI and emails',        true,  'store'),
  ('store.tagline',                  '"Smart Home Solutions"', 'Brand tagline shown in header and SEO', true,  'store'),
  ('store.currency',                 '"USD"',               'Default store currency (ISO 4217)',        true,  'store'),
  ('store.free_shipping_threshold',  '50',                  'Order total above which shipping is free (USD)', true, 'store'),
  ('store.returns_days',             '30',                  'Number of days customers have to return an order', true, 'store'),
  ('store.warranty_years',           '2',                   'Standard product warranty period in years', true,  'store'),
  ('ai.search_enabled',              'false',               'Enable AI-powered search (requires OpenAI key)', false, 'ai'),
  ('ai.recommendations_enabled',     'false',               'Enable AI personalised recommendations',   false, 'ai'),
  ('payments.stripe_enabled',        'false',               'Enable Stripe payment processing',         false, 'payments'),
  ('payments.paypal_enabled',        'false',               'Enable PayPal payment processing',         false, 'payments'),
  ('email.order_from',               '"orders@homenest.com"', 'From address for order confirmation emails', false, 'email'),
  ('reviews.require_verified_purchase', 'true',            'Only allow reviews from customers who purchased the product', false, 'reviews')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- Feature Flags
-- All disabled by default — enable progressively via admin.
-- ============================================================
INSERT INTO public.feature_flags (key, is_enabled, rollout_percentage, description)
VALUES
  ('ai_search',          false, 0,   'AI-powered natural language product search'),
  ('paypal',             false, 0,   'PayPal checkout option'),
  ('tiktok_feed',        false, 0,   'TikTok / Reels video feed on product pages'),
  ('wishlist',           false, 0,   'Wishlist feature for authenticated users'),
  ('recommendations',    false, 0,   'AI personalised product recommendations'),
  ('newsletter_popup',   false, 0,   'Exit-intent newsletter signup popup')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- Product Images
-- Two gallery images per product using demo Unsplash URLs.
-- media_id is NULL — no files uploaded to Supabase Storage yet.
-- cdn_url matches the static products.ts images array exactly
-- so the UI looks identical before and after the DB migration.
-- UUIDs use prefix d (d0000000-...).
-- ============================================================
INSERT INTO public.product_images (id, product_id, media_id, cdn_url, sort_order, is_primary)
VALUES
  -- Product 1: Silicone Sink Splash Guard
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NULL,
   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', NULL,
   'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', 1, false),

  -- Product 2: Bamboo Drawer Organizer Set
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', NULL,
   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', NULL,
   'https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800&q=80', 1, false),

  -- Product 3: Adjustable Shower Caddy
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', NULL,
   'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', NULL,
   'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', 1, false),

  -- Product 4: Magnetic Knife & Utensil Strip
  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', NULL,
   'https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', NULL,
   'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', 1, false),

  -- Product 5: Under-Sink Pull-Out Rack
  ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', NULL,
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', NULL,
   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 1, false),

  -- Product 6: Rotating Pantry Organizer
  ('d0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000006', NULL,
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', NULL,
   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80', 1, false),

  -- Product 7: Bamboo Bathroom Shelf Tower
  ('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000007', NULL,
   'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000007', NULL,
   'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80', 1, false),

  -- Product 8: Foldable Storage Cube Set
  ('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000008', NULL,
   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', 0, true),
  ('d0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000008', NULL,
   'https://images.unsplash.com/photo-1558618047-f3d1fed16e76?w=800&q=80', 1, false)
ON CONFLICT (id) DO NOTHING;
