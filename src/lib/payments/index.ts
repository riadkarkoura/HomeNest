import { createStripePaymentIntent, type PaymentIntentResult } from "./stripe";

export type { PaymentIntentResult };

// Single provider-agnostic boundary checkout code calls. Adding PayPal,
// Klarna, Apple Pay, or Google Pay later means adding a concrete module
// next to stripe.ts and branching here, not touching checkout UI or
// createOrder(). See ADR-022.
export async function createPaymentIntent(
  provider: string,
  amount: number,
  currency: string,
  metadata: Record<string, string>
): Promise<PaymentIntentResult> {
  switch (provider) {
    case "stripe":
      return createStripePaymentIntent(amount, currency, metadata);
    default:
      return { ok: false, error: `Unsupported payment provider: ${provider}` };
  }
}
