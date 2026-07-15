import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { verifySession } from "@/lib/auth/dal";
import { getOrderByNumber } from "@/lib/supabase/queries/orders";
import OrderSummary from "@/components/account/OrderSummary";

export const metadata: Metadata = { title: "Order Details" };

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const { user } = await verifySession();
  const order = await getOrderByNumber(orderNumber, user.id);

  if (!order) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>
      <h2 className="text-lg font-semibold text-stone-900">{order.order_number}</h2>
      <OrderSummary order={order} />
    </div>
  );
}
