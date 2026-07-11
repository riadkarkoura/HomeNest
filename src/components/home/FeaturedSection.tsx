"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/shop/ProductCard";


interface Props {
  products: Product[];
}

export default function FeaturedSection({ products }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 bg-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
            >
              Best Sellers
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
              className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
            >
              Products that work.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors group"
            >
              Browse all {" "}
              <span className="text-stone-400 group-hover:text-stone-600 transition-colors">
                ({products.length} shown)
              </span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100 border border-stone-100">
          {products.map((product, i) => (
            <div key={product.id} className="bg-white">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center sm:hidden"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-stone-700 border border-stone-300 px-6 py-3 hover:bg-stone-50 transition-colors"
          >
            View All Products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
