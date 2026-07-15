import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { verifySession } from "@/lib/auth/dal";
import { getOrderByNumber } from "@/lib/supabase/queries/orders";
import { Button } from "@/components/ui/button";
import OrderSummary from "@/components/account/OrderSummary";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  params: Promise<{ orderNumber: string }>;
}

// Authenticated only, same as order creation (ADR-022) -- there is no
// guest-viewable order in this design, so this page reuses verifySession()
// (redirecting), not getUser().
export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const { user } = await verifySession();
  const order = await getOrderByNumber(orderNumber, user.id);

  if (!order) notFound();

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <CheckCircle2 className="h-14 w-14 text-amber-600 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Thank you</p>
          <h1 className="text-3xl font-light text-stone-900">
            Order <span className="font-semibold">Confirmed</span>
          </h1>
          <p className="text-stone-500 mt-2">
            Order <span className="font-medium text-stone-900">{order.order_number}</span> has
            been placed.
          </p>
        </div>

        <OrderSummary order={order} />

        <div className="text-center mt-8 space-x-4">
          <Link href="/account/orders">
            <Button variant="outline" className="border-stone-200">
              View Order History
            </Button>
          </Link>
          <Link href="/products">
            <Button className="bg-stone-900 hover:bg-amber-700 text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
