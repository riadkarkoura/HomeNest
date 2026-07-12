-- ============================================================
-- Migration 006 — Product Edit write access (Sprint 7.1)
--
-- Purpose: Adds the UPDATE path for the Admin Product Studio's Edit
--          flow. Migration 005 added staff/admin INSERT (and a
--          narrow DELETE for Create's compensating rollback) on
--          products and seo_metadata — it did not add UPDATE, so
--          editing an existing product is not possible under RLS
--          until this migration runs. Same posture as ADR-013: no
--          SUPABASE_SERVICE_ROLE_KEY, authorization is entirely
--          get_my_role() IN ('staff','admin') against a real
--          authenticated session.
--
-- Run order: After 005.
-- ============================================================

CREATE POLICY "products_staff_update" ON public.products
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));

CREATE POLICY "seo_metadata_staff_update" ON public.seo_metadata
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_my_role() IN ('staff', 'admin'));
