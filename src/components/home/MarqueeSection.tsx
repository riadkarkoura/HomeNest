"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ITEMS = [
  "Cleverly Designed",
  "Problem Solvers",
  "Free Delivery Over $50",
  "2-Year Warranty",
  "30-Day Returns",
  "Worldwide Shipping",
  "Trusted by 50,000+ Homes",
  "Award Winning Design",
];

// Repeat twice so the infinite loop has no visible seam
const doubled = [...ITEMS, ...ITEMS];

export default function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden bg-stone-950 py-4 select-none"
      aria-hidden="true"
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 mx-6 text-[11px] uppercase tracking-[0.22em] text-stone-400 font-light"
          >
            {item}
            <span className="inline-block w-1 h-1 rounded-full bg-amber-600 flex-shrink-0" />
          </span>
        ))}
      </div>
    </motion.div>
  );
}
