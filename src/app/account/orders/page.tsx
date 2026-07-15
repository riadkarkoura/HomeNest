import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { verifySession } from "@/lib/auth/dal";
import { getOrders } from "@/lib/supabase/queries/orders";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const { user } = await verifySession();
  const orders = await getOrders(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
          <Package className="h-7 w-7 text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-900">Your orders will appear here</p>
        <p className="mt-1 text-xs text-stone-400 max-w-xs">
          Once you place your first order, you&apos;ll be able to track it from this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Your Orders</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.order_number}`}
            className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-5 hover:border-stone-300 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-stone-900">{order.order_number}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-stone-900">${order.total.toLocaleString()}</p>
              <p className="text-xs text-stone-400 capitalize mt-0.5">{order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
