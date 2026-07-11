"use client";

import { motion } from "framer-motion";
import {
  Shield, Zap, Droplets, Clock, Leaf, Package, Wrench,
  Sparkles, Check, Star, Ruler, Heart,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Benefit, ProductContent } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

// Icon name → Lucide component mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Zap, Droplets, Clock, Leaf, Package,
  Wrench, Sparkles, Check, Star, Ruler, Heart,
};

interface Props {
  content: Pick<ProductContent, "benefits">;
}

function BenefitCard({ benefit, index }: { benefit: Benefit; index: number }) {
  const Icon = ICON_MAP[benefit.iconName] ?? Check;

  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group bg-white p-7 rounded-lg shadow-sm border border-stone-100/80"
    >
      {/* Icon */}
      <div className="w-10 h-10 bg-amber-50 flex items-center justify-center rounded-lg mb-5 group-hover:bg-amber-100 transition-colors duration-300">
        <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-stone-900 mb-2 leading-snug">
        {benefit.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-stone-400 leading-relaxed font-light">
        {benefit.description}
      </p>
    </motion.div>
  );
}

export default function BenefitsSection({ content }: Props) {
  const cols =
    content.benefits.length <= 2
      ? "sm:grid-cols-2"
      : content.benefits.length === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section
      className="bg-white py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Key benefits"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
          >
            Why it works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
          >
            Built for <em>results.</em>
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className={`grid grid-cols-1 ${cols} gap-5`}
        >
          {content.benefits.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
