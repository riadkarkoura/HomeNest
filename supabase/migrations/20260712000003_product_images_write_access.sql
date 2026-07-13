-- ============================================================
-- Migration 007 — Product image upload write access (Sprint 6.1
-- remaining)
--
-- Purpose: Adds the write path for real image upload in the Admin
--          Product Studio's Media section, replacing the static
--          dropzone placeholders. Same posture as ADR-013/014/016:
--          no SUPABASE_SERVICE_ROLE_KEY, authorization is entirely
--          get_my_role() IN ('staff','admin') against a real
--          authenticated session, applied to every table/bucket a
--          new write path touches.
--
-- Three gaps close here, none of which existed before this
-- migration:
--   1. `media` had SELECT-only staff access (migration 004) — no
--      INSERT, so a media registry row could never be created
--      without the service_role key this app doesn't use.
--   2. `product_images` had public/staff SELECT only — no staff
--      INSERT/UPDATE/DELETE, so linking an uploaded image to a
--      product was blocked at the database regardless of
--      application code (same shape of gap ADR-016 closed for
--      products/seo_metadata UPDATE).
--   3. `storage.objects` had zero policies for the `products`
--      bucket — Storage RLS defaults to deny same as every other
--      table, so no upload could succeed even with (1) and (2) in
--      place.
--
-- The `products` Storage bucket itself is declared in
-- supabase/config.toml for local dev; this migration creates the
-- matching bucket row directly (idempotent) so it also exists on
-- the linked remote project, since config.toml's bucket block is
-- not applied by `db push`.
--
-- Run order: After 006.
-- ============================================================

-- ============================================================
-- Storage bucket — public read (product images are shown directly
-- via cdn_url on the storefront, same as Unsplash URLs today),
-- write gated by RLS below. Matches config.toml's declared limits.
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MiB
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Public bucket reads bypass RLS via the public object URL, so only
-- write operations need explicit policies here.
CREATE POLICY "products_bucket_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "products_bucket_staff_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- media — staff/admin INSERT
-- Needed so the upload action can register the file it just wrote
-- to Storage. SELECT already exists (migration 004).
-- ============================================================
CREATE POLICY "media_staff_insert" ON public.media
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- product_images — staff/admin INSERT + UPDATE + DELETE
-- The Studio's save flow replaces a product's entire image set on
-- every save (delete all, then re-insert the current draft's list)
-- rather than diffing — same "no transaction, keep it simple"
-- posture as ADR-015/ADR-016 — so DELETE and INSERT are both
-- required; UPDATE is included for parity/future use even though
-- the current sync helper doesn't call it.
-- ============================================================
CREATE POLICY "product_images_staff_insert" ON public.product_images
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "product_images_staff_update" ON public.product_images
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "product_images_staff_delete" ON public.product_images
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));
