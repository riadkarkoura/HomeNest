"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { ProductContent } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  content: ProductContent;
  productName: string;
}

export default function ProblemSection({ content, productName }: Props) {
  return (
    <section
      className="bg-stone-950 py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Problem this solves"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: headline + intro ──────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEW_ONCE}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 mb-5"
            >
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80">
                The Problem
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={0.1}
              className="display-section text-[clamp(1.75rem,4vw,3rem)] text-white mb-6 leading-tight"
            >
              {content.problemHeadline}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="text-[15px] text-stone-400 font-light leading-relaxed"
            >
              {content.problemIntro}
            </motion.p>
          </motion.div>

          {/* ── Right: problem points ───────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEW_ONCE}
            variants={stagger}
            className="space-y-5"
          >
            {content.problemPoints.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.08}
                className="flex items-start gap-4 group"
              >
                {/* Numbered indicator */}
                <div className="flex-shrink-0 w-7 h-7 border border-white/10 flex items-center justify-center group-hover:border-amber-400/30 transition-colors duration-300">
                  <span className="text-[10px] text-stone-600 font-medium group-hover:text-amber-400/60 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[15px] text-stone-300 font-light leading-relaxed pt-0.5">
                  {point}
                </p>
              </motion.div>
            ))}

            {/* "Sound familiar?" callout */}
            <motion.div
              variants={fadeUp}
              custom={content.problemPoints.length * 0.08 + 0.1}
              className="mt-8 p-5 border border-amber-400/15 bg-amber-400/[0.04]"
            >
              <p className="text-[13px] text-amber-300/70 font-light leading-relaxed">
                <span className="font-medium text-amber-300/90">Sound familiar?</span>{" "}
                You&apos;re not alone — this is one of the most searched household problems in homes worldwide.{" "}
                <span className="text-amber-300/90">{productName} solves it permanently.</span>
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
