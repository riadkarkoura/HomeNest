-- ============================================================
-- Migration: Atomic, idempotent order creation (Sprint 8.2)
-- ============================================================
-- createOrder() (src/app/checkout/actions.ts) previously wrote orders,
-- order_items, and the cart's conversion as three separate network calls --
-- a failure between them could leave a real order row with zero line items
-- ("ghost order"), and nothing stopped the same cart producing two orders
-- under a double-submit or a genuine concurrent request. This function
-- replaces that three-call sequence with one transactional, idempotent
-- write. See ADR-023.
--
-- SECURITY INVOKER (the default) -- unlike the Sprint 8.0 Stripe webhook
-- functions, the caller here IS the authenticated customer, so RLS on
-- carts/orders/order_items enforces ownership on every statement inside
-- this function exactly as it would on separate calls. No auth.uid() check
-- is written explicitly below because it doesn't need to be: RLS already
-- makes a cross-user cart_id resolve to zero rows.
--
-- All business logic (validation, pricing, snapshot-building) stays in
-- TypeScript, per explicit instruction -- this function does only the
-- final write: lock the cart, check for a prior conversion, insert
-- orders + order_items, convert the cart. Kept deliberately small.

CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_cart_id uuid,
  p_subtotal numeric,
  p_shipping_cost numeric,
  p_tax numeric,
  p_discount numeric,
  p_total numeric,
  p_currency text,
  p_payment_provider text,
  p_shipping_method text,
  p_shipping_address_id uuid,
  p_shipping_address_snapshot jsonb,
  p_billing_address_snapshot jsonb,
  p_customer_notes text,
  p_order_items jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_cart_user_id uuid;
  v_converted_order_id uuid;
  v_order_id uuid;
  v_order_number text;
BEGIN
  -- Row lock held for the rest of this transaction: a second concurrent
  -- call for the same cart blocks here until this one commits, then sees
  -- converted_order_id already set and takes the idempotent branch below
  -- instead of racing to insert a second order.
  SELECT user_id, converted_order_id
    INTO v_cart_user_id, v_converted_order_id
    FROM public.carts
    WHERE id = p_cart_id
    FOR UPDATE;

  IF NOT FOUND THEN
    -- RLS filters this to "not found" for a cart that doesn't belong to
    -- the caller, same effect as an explicit ownership check.
    RAISE EXCEPTION 'Cart not found';
  END IF;

  IF v_converted_order_id IS NOT NULL THEN
    SELECT id, order_number
      INTO v_order_id, v_order_number
      FROM public.orders
      WHERE id = v_converted_order_id;

    RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
  END IF;

  INSERT INTO public.orders (
    user_id, status, payment_status, fulfillment_status,
    subtotal, shipping_cost, tax, discount, total, currency,
    payment_provider, shipping_method, shipping_address_id,
    shipping_address_snapshot, billing_address_snapshot, customer_notes
  ) VALUES (
    v_cart_user_id, 'pending', 'unpaid', 'unfulfilled',
    p_subtotal, p_shipping_cost, p_tax, p_discount, p_total, p_currency,
    p_payment_provider, p_shipping_method, p_shipping_address_id,
    p_shipping_address_snapshot, p_billing_address_snapshot, p_customer_notes
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  INSERT INTO public.order_items (
    order_id, product_id, variant_id, product_snapshot,
    quantity, unit_price, subtotal, discount, total
  )
  SELECT
    v_order_id,
    (item->>'product_id')::uuid,
    NULLIF(item->>'variant_id', '')::uuid,
    item->'product_snapshot',
    (item->>'quantity')::integer,
    (item->>'unit_price')::numeric,
    (item->>'subtotal')::numeric,
    (item->>'discount')::numeric,
    (item->>'total')::numeric
  FROM jsonb_array_elements(p_order_items) AS item;

  UPDATE public.carts
    SET status = 'converted', converted_order_id = v_order_id
    WHERE id = p_cart_id;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_atomic(
  uuid, numeric, numeric, numeric, numeric, numeric, text, text, text,
  uuid, jsonb, jsonb, text, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_atomic(
  uuid, numeric, numeric, numeric, numeric, numeric, text, text, text,
  uuid, jsonb, jsonb, text, jsonb
) TO authenticated;
