import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { constructStripeWebhookEvent } from "@/lib/payments/stripe";

// Server-to-server, no end-user session -- the signature check below is
// the entire authorization boundary (see ADR-022's addendum). The actual
// order update runs through apply_stripe_payment_result(), a SECURITY
// DEFINER function, not a service-role key.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const event = constructStripeWebhookEvent(payload, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { error } = await supabase.rpc("apply_stripe_payment_result", {
      p_payment_intent_id: intent.id,
      p_status: "processing",
      p_payment_status: "paid",
    });
    if (error) console.error("[stripe webhook] apply_stripe_payment_result failed", error);
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { error } = await supabase.rpc("apply_stripe_payment_result", {
      p_payment_intent_id: intent.id,
      p_status: "cancelled",
      p_payment_status: "failed",
    });
    if (error) console.error("[stripe webhook] apply_stripe_payment_result failed", error);
  }

  return NextResponse.json({ received: true });
}
