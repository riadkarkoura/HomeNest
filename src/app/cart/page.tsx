"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const total = totalPrice();
  const shipping = total >= 500 ? 0 : 45;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <ShoppingBag className="h-20 w-20 text-stone-200 mx-auto" />
          <h1 className="text-2xl font-light text-stone-900">Your cart is empty</h1>
          <p className="text-stone-500">Time to find something beautiful.</p>
          <Link href="/products">
            <Button className="bg-stone-900 hover:bg-amber-700 text-white mt-4">
              Explore the Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-600 mb-1">Review Your Order</p>
            <h1 className="text-3xl font-light text-stone-900">
              Shopping <span className="font-semibold">Cart</span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-stone-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-5 flex gap-5 border border-stone-100"
              >
                <Link href={`/products/${product.slug}`} className="relative w-28 h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">
                        {product.category}
                      </p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-medium text-stone-900 hover:text-amber-700 transition-colors mt-0.5">
                          {product.name}
                        </h3>
                      </Link>
                      {product.material && (
                        <p className="text-xs text-stone-400 mt-1">{product.material}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1.5 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium border-x border-stone-200 min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-1.5 hover:bg-stone-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-900">
                        ${(product.price * quantity).toLocaleString()}
                      </p>
                      {quantity > 1 && (
                        <p className="text-xs text-stone-400">
                          ${product.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mt-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-stone-100 sticky top-24 space-y-5">
              <h2 className="font-semibold text-stone-900 text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : `$${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-stone-400">
                    Add ${(500 - total).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <Separator />

              {/* Promo code */}
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1.5">
                  <Tag className="h-4 w-4" /> Promo Code
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" className="px-4">
                    Apply
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-stone-900 text-lg">
                <span>Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>

              <Button className="w-full bg-stone-900 hover:bg-amber-700 text-white py-6 text-base">
                Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <p className="text-xs text-stone-400 text-center">
                Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
