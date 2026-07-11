"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const total = totalPrice();

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4">
        <SheetTitle className="text-lg font-semibold text-stone-900">
          Shopping Cart ({items.length})
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <ShoppingBag className="h-16 w-16 text-stone-200" />
          <div>
            <p className="font-medium text-stone-700">Your cart is empty</p>
            <p className="text-sm text-stone-400 mt-1">
              Add some beautiful pieces to get started
            </p>
          </div>
          <SheetClose render={<Link href="/products" className="mt-2" />}>
            <Button className="bg-stone-900 hover:bg-amber-700 text-white">
              Explore Products
            </Button>
          </SheetClose>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 py-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-amber-700 font-semibold mt-0.5">
                    ${product.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 rounded border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 rounded border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-medium text-stone-900">${total.toLocaleString()}</span>
            </div>
            {total < 500 && (
              <p className="text-xs text-stone-400">
                Add ${(500 - total).toLocaleString()} more for free shipping
              </p>
            )}
            <SheetClose render={<Link href="/cart" className="block" />}>
              <Button className="w-full bg-stone-900 hover:bg-amber-700 text-white">
                View Cart & Checkout
              </Button>
            </SheetClose>
          </div>
        </>
      )}
    </div>
  );
}
