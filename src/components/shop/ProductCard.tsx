"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";


interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group relative bg-white flex flex-col"
      style={{ transition: "box-shadow 0.4s ease" }}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-stone-100"
        style={{ aspectRatio: "4/3" }}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {discount && (
            <Badge className="bg-stone-950 hover:bg-stone-950 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-none">
              −{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider rounded-none">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Quick-add button — appears on hover */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-40"
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="h-4 w-4 text-stone-900" />
        </motion.button>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">
          {product.category}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[15px] font-medium text-stone-900 group-hover:text-amber-700 transition-colors leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-[13px] text-stone-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-stone-200 fill-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-stone-900 tracking-tight">
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-stone-400 line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            className="text-[11px] uppercase tracking-widest text-amber-700 hover:text-amber-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.inStock ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
