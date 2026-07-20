"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  Check,
  Truck,
  RotateCcw,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { EASE } from "@/lib/motion";

interface Props {
  product: Product;
  quantity: number;
  wishlisted: boolean;
  added: boolean;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishlist: () => void;
  buyRef?: React.RefObject<HTMLDivElement | null>;
}

const TRUST = [
  { icon: Truck,      text: "Free delivery over $50" },
  { icon: RotateCcw, text: "30-day free returns"     },
  { icon: Shield,    text: "2-year warranty"          },
];

export default function ProductHero({
  product,
  quantity,
  wishlisted,
  added,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  onWishlist,
  buyRef,
}: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const nextImage = () => setSelectedImage((i) => (i + 1) % product.images.length);
  const prevImage = () =>
    setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length);

  return (
    <section className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <nav className="flex items-center gap-1.5 text-[12px] text-stone-400">
          <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-700 transition-colors">Solutions</Link>
          <span>/</span>
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-stone-700 transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-stone-700 font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Image pane ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            {/* Main image */}
            <div
              className="relative aspect-square bg-stone-100 overflow-hidden cursor-zoom-in"
              onClick={() => setLightbox(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.badge && (
                  <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-none w-fit">
                    {product.badge}
                  </Badge>
                )}
                {discount && (
                  <Badge className="bg-stone-950 hover:bg-stone-950 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-none w-fit">
                    −{discount}%
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider rounded-none w-fit">
                    Sold Out
                  </Badge>
                )}
              </div>

              {/* Nav arrows — only when multiple images */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 text-stone-700" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 text-stone-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      selectedImage === i ? "border-amber-600" : "border-stone-200 hover:border-stone-400"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Buy pane ───────────────────────────────────────────────────── */}
          <motion.div
            ref={buyRef}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
            className="flex flex-col gap-6"
          >
            {/* Category + name */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-2">
                {product.category}
              </p>
              <h1 className="display-section text-[clamp(1.75rem,4vw,2.75rem)] text-stone-900 leading-tight mb-3">
                {product.name}
              </h1>
              <p className="text-[15px] text-stone-500 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-stone-200 fill-stone-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[13px] text-stone-500">
                {product.rating} · {product.reviewCount.toLocaleString()} reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-stone-900 tracking-tight">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-stone-400 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-amber-700">
                    Save ${(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-600 font-medium">Quantity</span>
              <div className="flex items-center border border-stone-200">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 hover:bg-stone-50 transition-colors text-stone-700 text-lg leading-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-5 py-2.5 text-sm font-medium border-x border-stone-200 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="px-4 py-2.5 hover:bg-stone-50 transition-colors text-stone-700 text-lg leading-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAddToCart}
                disabled={!product.inStock}
                className={`flex-1 inline-flex items-center justify-center gap-3 py-4 text-[13px] font-medium tracking-[0.06em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-stone-950 hover:bg-amber-700 text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onWishlist}
                className={`px-4 py-4 border transition-colors ${
                  wishlisted
                    ? "border-amber-600 text-amber-600 bg-amber-50"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`h-5 w-5 ${wishlisted ? "fill-amber-600" : ""}`}
                />
              </motion.button>
            </div>

            {/* Buy Now -- Sprint 9.1: reuses the same onAddToCart the
                button above calls, then navigates straight to checkout
                (see ProductDetailClient.tsx's handleBuyNow). */}
            {product.inStock && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onBuyNow}
                className="w-full inline-flex items-center justify-center gap-3 border border-stone-950 py-4 text-[13px] font-medium tracking-[0.06em] uppercase text-stone-950 hover:bg-stone-950 hover:text-white transition-all duration-300"
              >
                Buy Now
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            )}

            {/* Trust badges */}
            <div className="border-t border-stone-100 pt-5 space-y-3">
              {TRUST.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-stone-400 flex-shrink-0" />
                  <span className="text-[13px] text-stone-600">{text}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-stone-100 text-[11px] text-stone-500 uppercase tracking-wider rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="relative max-w-3xl w-full aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
