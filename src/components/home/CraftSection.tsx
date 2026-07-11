"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";


const PILLARS = [
  {
    number: "01",
    title: "Real Solutions",
    body: "Every product we carry solves a specific household problem. We test in real kitchens, real bathrooms, and real homes — not in a showroom.",
  },
  {
    number: "02",
    title: "Built to Last",
    body: "We quality-check everything before it ships. If a product doesn't hold up within two years, we replace it. No forms. No arguments.",
  },
  {
    number: "03",
    title: "Fast Delivery",
    body: "Free shipping on orders over $50. Most orders arrive in 3–5 business days. Easy 30-day returns, no questions asked.",
  },
];

export default function CraftSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-40 bg-stone-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-4"
            >
              Our Standard
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
              className="display-section text-[clamp(2rem,5vw,3.75rem)] text-white"
            >
              The HomeNest<br />difference.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-stone-400 max-w-xs font-light leading-relaxed text-sm lg:text-base"
          >
            We hold ourselves to a standard most home brands won't talk about.
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
              className="group px-0 md:px-10 py-10 md:py-0 first:pl-0 last:pr-0"
            >
              {/* Number */}
              <span className="display-section text-5xl text-white/10 group-hover:text-amber-600/30 transition-colors duration-500 block mb-6">
                {pillar.number}
              </span>

              {/* Animated line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: EASE }}
                style={{ originX: 0 }}
                className="w-8 h-px bg-amber-600 mb-6"
              />

              <h3 className="text-lg font-medium text-white mb-3 tracking-wide">
                {pillar.title}
              </h3>
              <p className="text-stone-400 font-light leading-relaxed text-sm">
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-8"
        >
          {[
            ["Free shipping", "Orders over $50"],
            ["2-year warranty", "All products"],
            ["30-day returns", "No questions asked"],
            ["50,000+ homes", "Worldwide delivery"],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="text-sm font-medium text-white mb-1">{title}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider">{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
