import Stripe from "stripe";

// Lazily constructed, never at module load -- STRIPE_SECRET_KEY is not
// configured yet in this environment (external dependency, same category
// as Sprint 7.0's Google OAuth setup). Returning null lets callers report
// a clean "not configured" error instead of crashing.
function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export interface PaymentIntentResult {
  ok: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export async function createStripePaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>
): Promise<PaymentIntentResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { ok: false, error: "Stripe is not configured yet (STRIPE_SECRET_KEY missing)." };
  }

  try {
    // Card-only, deliberately (Sprint 8.3, ADR-024) -- automatic_payment_methods
    // would let Stripe surface redirect-based methods (e.g. iDEAL), and the
    // checkout flow has no handling yet for a customer returning from an
    // off-site redirect. Revisit alongside the European-scalability work,
    // not before. Not "another provider" -- payment_method_types is a Stripe
    // API option, this is still the single Stripe integration.
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      payment_method_types: ["card"],
    });

    return { ok: true, clientSecret: intent.client_secret ?? undefined, paymentIntentId: intent.id };
  } catch (err) {
    console.error("[createStripePaymentIntent]", err);
    return { ok: false, error: "Failed to initialize payment." };
  }
}

// Sprint 8.3 (ADR-024): lets the intent route reuse an existing PaymentIntent
// instead of creating a new one on every call for the same order.
export async function retrieveStripePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error("[retrieveStripePaymentIntent]", err);
    return null;
  }
}

export function constructStripeWebhookEvent(payload: string, signature: string): Stripe.Event | null {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[constructStripeWebhookEvent]", err);
    return null;
  }
}
