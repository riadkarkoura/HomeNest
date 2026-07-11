"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/shop/ProductCard";
import { VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  products: Product[];
  category: string;
}

export default function RelatedSection({ products, category }: Props) {
  if (products.length === 0) return null;

  return (
    <section
      className="bg-stone-50 py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Related solutions"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW_ONCE}
              transition={{ duration: 0.7 }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
            >
              Related Solutions
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW_ONCE}
              transition={{ duration: 0.85, delay: 0.08 }}
              className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
            >
              You might also <em>need.</em>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW_ONCE}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Link
              href={`/products?category=${encodeURIComponent(category)}`}
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 group transition-colors duration-200"
            >
              View all {category} solutions
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* Product cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
