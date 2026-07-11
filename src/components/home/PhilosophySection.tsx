"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE, stagger, VIEW_ONCE } from "@/lib/motion";

const STATEMENT =
  "We believe a well-organised home is a calmer, happier home. Every product we carry is chosen with one question in mind — does it genuinely make everyday life easier?";


// Split into words and animate each one in sequence
function AnimatedStatement({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={VIEW_ONCE}
      className="inline"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0.15 },
            visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function PhilosophySection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-28 sm:py-40 px-6 sm:px-8 lg:px-12 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-10"
        >
          Our Mission
        </motion.p>

        {/* Large animated statement */}
        <p className="display-section text-[clamp(1.75rem,4vw,3.25rem)] text-stone-900 leading-[1.15]">
          <AnimatedStatement text={STATEMENT} />
        </p>

        {/* Rule + attribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
          className="flex items-center gap-4 mt-12"
        >
          <div className="w-8 h-px bg-amber-600" />
          <span className="text-xs text-stone-500 uppercase tracking-widest">
            Founded 2019 · Trusted globally
          </span>
        </motion.div>
      </div>
    </section>
  );
}
