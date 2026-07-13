import type { Metadata } from "next";
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
        <Package className="h-7 w-7 text-stone-400" />
      </div>
      <p className="text-sm font-medium text-stone-900">Your orders will appear here</p>
      <p className="mt-1 text-xs text-stone-400 max-w-xs">
        Order tracking and history are coming in a future update.
      </p>
    </div>
  );
}
