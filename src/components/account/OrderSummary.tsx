import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import type { OrderRow } from "@/lib/supabase/queries/orders";

// Shared between /order-confirmation/[orderNumber] and
// /account/orders/[orderNumber] -- same immutable order snapshot, just
// wrapped in different page chrome (Sprint 8.0).
export default function OrderSummary({ order }: { order: OrderRow }) {
  const shipping = order.shipping_address_snapshot as Record<string, string>;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-6">
      <div className="space-y-3">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
              {item.product_snapshot.image && (
                <Image
                  src={item.product_snapshot.image}
                  alt={item.product_snapshot.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">
                {item.product_snapshot.name}
              </p>
              <p className="text-xs text-stone-400">
                SKU {item.product_snapshot.sku}
                {item.product_snapshot.variant
                  ? ` · ${item.product_snapshot.variant.optionName}: ${item.product_snapshot.variant.optionValue}`
                  : ""}
                {" · "}Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium text-stone-900">${item.total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>${order.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Shipping</span>
          <span>{order.shipping_cost === 0 ? "Free" : `$${order.shipping_cost}`}</span>
        </div>
        <div className="flex justify-between font-semibold text-stone-900 text-base pt-1">
          <span>Total</span>
          <span>${order.total.toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium text-stone-900 mb-1">Shipping to</p>
          <p className="text-stone-600">
            {shipping.first_name} {shipping.last_name}
          </p>
          <p className="text-stone-600">{shipping.line1}</p>
          <p className="text-stone-600">
            {shipping.city}
            {shipping.state ? `, ${shipping.state}` : ""} {shipping.postal_code}
          </p>
          <p className="text-stone-600">{shipping.country_code}</p>
        </div>
        <div>
          <p className="font-medium text-stone-900 mb-1">Order Status</p>
          <p className="text-stone-600 capitalize">{order.status}</p>
          <p className="text-stone-600 capitalize">Payment: {order.payment_status}</p>
        </div>
      </div>
    </div>
  );
}
