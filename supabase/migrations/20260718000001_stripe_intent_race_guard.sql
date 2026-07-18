-- Patch 8.4.1 -- Stripe PaymentIntent creation race guard.
--
-- Two near-simultaneous requests for the same order could both observe
-- orders.stripe_payment_intent_id = NULL, both create a real Stripe
-- PaymentIntent, and then both call record_stripe_payment_intent() --
-- whichever wrote last silently overwrote the other, permanently
-- orphaning one PaymentIntent in Stripe with no order ever referencing
-- it (found live during Sprint 8.4 verification: two Stripe
-- PaymentIntents per order, identical metadata, created the same second).
--
-- Fix: make the write itself the single source of truth for "who won."
-- The UPDATE now only succeeds while stripe_payment_intent_id is still
-- NULL -- Postgres implicitly row-locks whatever an UPDATE is about to
-- touch, so two concurrent calls for the same order naturally serialize
-- against each other with no explicit lock needed (no FOR UPDATE, no
-- global lock). The function always returns the order's *current*
-- stripe_payment_intent_id after the attempt, whether this call's own
-- write won or not, so the caller can tell which case it's in and reuse
-- the winner's intent instead of trusting its own.
DROP FUNCTION IF EXISTS public.record_stripe_payment_intent(uuid, text);

CREATE FUNCTION public.record_stripe_payment_intent(
  p_order_id uuid,
  p_payment_intent_id text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner text;
BEGIN
  UPDATE public.orders
  SET stripe_payment_intent_id = p_payment_intent_id
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND stripe_payment_intent_id IS NULL
  RETURNING stripe_payment_intent_id INTO v_winner;

  IF v_winner IS NULL THEN
    -- Either this call lost the race (another request's write already
    -- landed first) or the order doesn't exist/isn't owned by this
    -- caller -- either way, report back whatever is actually stored now.
    SELECT stripe_payment_intent_id INTO v_winner
    FROM public.orders
    WHERE id = p_order_id AND user_id = auth.uid();
  END IF;

  RETURN v_winner;
END;
$$;

REVOKE ALL ON FUNCTION public.record_stripe_payment_intent(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_stripe_payment_intent(uuid, text) TO authenticated;
