-- ============================================================
-- Sprint 8.3: prevent out-of-order Stripe webhook delivery from
-- downgrading an already-paid order (ADR-024)
-- ============================================================
-- Stripe does not guarantee webhook events arrive in the order they
-- occurred, and can redeliver the same event. Without this guard, a stale
-- payment_intent.payment_failed event arriving after the payment_intent.
-- succeeded event for the same intent (plausible under Stripe's own retry
-- behavior) would incorrectly flip a paid order back to failed.
--
-- Replaces the existing function (same signature, same SECURITY DEFINER
-- posture, same grants) -- only the body changes: refuse to move
-- payment_status away from 'paid' once it's been set there. Reapplying the
-- same event twice remains harmless (already idempotent in effect), and a
-- stray late failure event for an already-paid order is now a no-op
-- instead of a data-corrupting downgrade.

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
  WHERE stripe_payment_intent_id = p_payment_intent_id
    AND payment_status != 'paid';
END;
$$;

REVOKE ALL ON FUNCTION public.apply_stripe_payment_result(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_stripe_payment_result(text, text, text) TO anon, authenticated;
