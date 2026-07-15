"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

// null when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn't set -- Stripe is not
// configured in this environment yet (external dependency, same category
// as Sprint 7.0's Google OAuth setup). The order still exists (created
// pending/unpaid by createOrder()) regardless of whether this succeeds.
const stripePromise: Promise<Stripe | null> | null = process.env
  .NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Props {
  orderNumber: string;
}

function PayForm({ orderNumber }: { orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order-confirmation/${orderNumber}` },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        onClick={handlePay}
        disabled={!stripe || submitting}
        className="w-full bg-stone-900 hover:bg-amber-700 text-white py-6"
      >
        {submitting ? "Processing…" : "Pay Now"}
      </Button>
    </div>
  );
}

// Order creation and payment collection are decoupled (matches the
// already-documented flow in docs/ARCHITECTURE.md §12.1): the order exists
// as pending/unpaid the moment createOrder() returns, so a customer is
// never blocked from seeing their order just because Stripe isn't
// configured or a card is declined.
export default function CheckoutPayment({ orderNumber }: Props) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/stripe/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error ?? "Payment is not available right now.");
      })
      .catch(() => setError("Payment is not available right now."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-6">
        <p className="text-sm text-stone-500">Preparing payment…</p>
      </div>
    );
  }

  if (error || !clientSecret || !stripePromise) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
        <p className="text-sm text-stone-600">
          {error ?? "Payment is not available right now."} Your order has been saved and is
          pending payment.
        </p>
        <Button
          onClick={() => router.push(`/order-confirmation/${orderNumber}`)}
          className="w-full bg-stone-900 hover:bg-amber-700 text-white py-6"
        >
          View Order
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6">
      <h2 className="font-semibold text-stone-900 text-lg mb-4">Payment</h2>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PayForm orderNumber={orderNumber} />
      </Elements>
    </div>
  );
}
