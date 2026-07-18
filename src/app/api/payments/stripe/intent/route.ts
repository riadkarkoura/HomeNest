import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/dal";
import { createPaymentIntent } from "@/lib/payments";
import { retrieveStripePaymentIntent } from "@/lib/payments/stripe";

// Statuses where the existing PaymentIntent is still usable -- reuse its
// client_secret instead of creating a new one (Sprint 8.3, ADR-024). Any
// other status (canceled, succeeded, processing) falls through to creating
// a fresh intent, since the old one is no longer confirmable.
const REUSABLE_STATUSES = ["requires_payment_method", "requires_confirmation", "requires_action"];

export async function POST(request: Request) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { user, supabase } = session;

  const body = await request.json().catch(() => null);
  const orderNumber = body?.orderNumber;
  if (typeof orderNumber !== "string") {
    return NextResponse.json({ error: "Missing orderNumber." }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, currency, payment_status, stripe_payment_intent_id")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status !== "unpaid") {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });
  }

  // Reuse an existing, still-payable intent rather than creating a second
  // one for the same order every time this route is called (a reload before
  // paying, a retried request) -- avoids orphaning PaymentIntents in Stripe.
  if (order.stripe_payment_intent_id) {
    const existing = await retrieveStripePaymentIntent(order.stripe_payment_intent_id);
    if (existing && REUSABLE_STATUSES.includes(existing.status)) {
      return NextResponse.json({ clientSecret: existing.client_secret });
    }
    if (existing?.status === "succeeded") {
      return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });
    }
    // canceled/processing/no-longer-retrievable -- fall through and create a
    // fresh intent below.
  }

  const result = await createPaymentIntent("stripe", Number(order.total), order.currency, {
    orderId: order.id,
    orderNumber,
  });

  if (!result.ok || !result.clientSecret || !result.paymentIntentId) {
    return NextResponse.json({ error: result.error ?? "Failed to initialize payment." }, { status: 502 });
  }

  const { data: recordedId, error: rpcError } = await supabase.rpc("record_stripe_payment_intent", {
    p_order_id: order.id,
    p_payment_intent_id: result.paymentIntentId,
  });

  if (rpcError) {
    console.error("[stripe intent] record_stripe_payment_intent failed", rpcError);
    return NextResponse.json({ clientSecret: result.clientSecret });
  }

  // Patch 8.4.1: record_stripe_payment_intent() now only writes while
  // stripe_payment_intent_id is still NULL, so two near-simultaneous
  // requests for the same order naturally race for that single write --
  // it always returns whichever id actually ended up stored. If that's
  // not the id this request just created, this request lost the race.
  if (recordedId && recordedId !== result.paymentIntentId) {
    // The PaymentIntent created above is real but now orphaned --
    // intentionally left alone here, not canceled or deleted. Canceling
    // it would add another Stripe API call to the checkout hot path for
    // a purely cosmetic cleanup with no correctness benefit: it's
    // unconfirmed, nothing was ever charged, and Stripe expires
    // unconfirmed PaymentIntents on its own. See the "PaymentIntent
    // orphan cleanup" backlog item (docs/ROADMAP.md) for the deferred,
    // purely operational follow-up -- it must never become part of this
    // correctness path.
    const winner = await retrieveStripePaymentIntent(recordedId);
    if (winner?.client_secret) {
      return NextResponse.json({ clientSecret: winner.client_secret });
    }
    // Winner's intent couldn't be retrieved (shouldn't normally happen)
    // -- fall back to this request's own intent rather than fail the
    // checkout outright.
  }

  return NextResponse.json({ clientSecret: result.clientSecret });
}
