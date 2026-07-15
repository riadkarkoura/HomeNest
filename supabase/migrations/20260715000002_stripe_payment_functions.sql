-- ============================================================
-- Migration: Stripe payment RPC functions (Sprint 8.0)
-- ============================================================
-- Two narrowly-scoped SECURITY DEFINER functions cover the one part of
-- checkout with no end-user session to attach RLS to: Stripe's webhook.
-- This replaces what would otherwise need a service-role key (forbidden,
-- ADR-013) with a pair of single-purpose functions, each re-checking its
-- own authorization rather than trusting the caller's role -- narrower
-- than the blanket table access a service-role key would grant. See
-- ADR-022.

-- Called by the customer's own authenticated session immediately after
-- Stripe PaymentIntent creation, to attach the intent id to their order.
-- Re-checks ownership internally (auth.uid() = orders.user_id) since it
-- must stay safe even though SECURITY DEFINER bypasses RLS.
CREATE OR REPLACE FUNCTION public.record_stripe_payment_intent(
  p_order_id uuid,
  p_payment_intent_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET stripe_payment_intent_id = p_payment_intent_id
  WHERE id = p_order_id
    AND user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.record_stripe_payment_intent(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_stripe_payment_intent(uuid, text) TO authenticated;

-- Called only by /api/webhooks/stripe, only after that Route Handler has
-- verified Stripe's HMAC signature on the raw request body -- the
-- signature check IS the authorization boundary here, playing the same
-- role auth.uid() + RLS play for every user-initiated write in this app.
-- Scoped to exactly the one row whose stripe_payment_intent_id matches.
CREATE OR REPLACE FUNCTION public.apply_stripe_payment_result(
  p_payment_intent_id text,
  p_status text,
  p_payment_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET status = p_status,
      payment_status = p_payment_status
  WHERE stripe_payment_intent_id = p_payment_intent_id;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_stripe_payment_result(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_stripe_payment_result(text, text, text) TO anon, authenticated;
