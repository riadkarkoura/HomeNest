-- ============================================================
-- Migration 005 — Product Create write access (Sprint 6)
--
-- Purpose: Adds the write path for the Admin "Add Product" Studio.
--          Product Create is implemented as a Server Action using
--          the normal cookie-based (anon key) Supabase client — no
--          SUPABASE_SERVICE_ROLE_KEY is used anywhere in the app.
--          That means admin writes can no longer rely on migration
--          004's stated assumption ("service_role bypasses RLS
--          entirely — no explicit admin policies needed"). This
--          migration adds the explicit staff/admin policies that
--          assumption was standing in for.
--
-- Run order: After 004 (RLS must already be enabled + FORCE'd on
--            products and seo_metadata).
--
-- Two schema additions are included because the Add Product Studio
-- (Sprint 5.1) already collects "benefits" and SEO "keywords", and
-- neither had a column anywhere in the original design (DATABASE.md
-- v1.0) — this migration closes that gap rather than silently
-- dropping the data the UI collects.
--
-- No RPC / transaction function is introduced here. The Create
-- Server Action performs two plain inserts (products, then
-- seo_metadata) and compensates with a DELETE on products if the
-- second insert fails. The products_staff_delete policy below
-- exists to support that compensation, not general admin deletes.
-- Revisit with a real transaction (Postgres function) if a future
-- sprint (AI import, bulk import) needs true multi-table atomicity.
-- ============================================================

-- ============================================================
-- Schema additions
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.seo_metadata
  ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}'::text[];


-- ============================================================
-- products — staff/admin INSERT + DELETE
-- SELECT policies already exist (migration 004). Only staff/admin
-- may create or delete products; there is no authenticated-user
-- INSERT/DELETE path (customers never write to this table).
-- ============================================================
CREATE POLICY "products_staff_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "products_staff_delete" ON public.products
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'));


-- ============================================================
-- seo_metadata — staff/admin INSERT
-- Previously had zero write policies of any kind (public SELECT
-- only). Needed so the Create action can attach meta title /
-- description / keywords to the product it just inserted.
-- ============================================================
CREATE POLICY "seo_metadata_staff_insert" ON public.seo_metadata
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));
