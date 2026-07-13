import type { Metadata } from "next";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
        <Heart className="h-7 w-7 text-stone-400" />
      </div>
      <p className="text-sm font-medium text-stone-900">Your wishlist is empty</p>
      <p className="mt-1 text-xs text-stone-400 max-w-xs">
        Saving favorites for later is coming in a future update.
      </p>
    </div>
  );
}
