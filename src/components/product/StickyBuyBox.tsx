"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types";
import { EASE } from "@/lib/motion";

interface Props {
  product: Product;
  visible: boolean;
  added: boolean;
  onAddToCart: () => void;
}

export default function StickyBuyBox({ product, visible, added, onAddToCart }: Props) {
  return (
    // Only renders on lg+ — hidden on mobile to avoid layout conflicts
    <div className="hidden lg:block">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 64 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 64 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed right-6 bottom-8 z-40 w-72 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-stone-100"
            role="region"
            aria-label="Quick buy"
          >
            {/* Product row */}
            <div className="flex items-center gap-3 p-4 border-b border-stone-100">
              <div className="relative w-12 h-12 bg-stone-100 flex-shrink-0 overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-stone-900 truncate leading-snug">
                  {product.name}
                </p>
                <p className="text-[13px] font-semibold text-stone-900 mt-0.5">
                  ${product.price.toLocaleString()}
                  {product.originalPrice && (
                    <span className="ml-2 text-stone-400 line-through text-[11px] font-normal">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAddToCart}
                disabled={!product.inStock}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 text-[12px] font-medium tracking-[0.06em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-stone-950 hover:bg-amber-700 text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
