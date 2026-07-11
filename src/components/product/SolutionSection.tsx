"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { ProductContent } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  content: ProductContent;
  productName: string;
  productImage: string;
}

export default function SolutionSection({ content, productName, productImage }: Props) {
  return (
    <section
      className="bg-[#FAFAF8] py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="How this product solves the problem"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: image ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEW_ONCE}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative aspect-square bg-stone-100 overflow-hidden order-last lg:order-first"
          >
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Decorative amber edge */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-transparent" />
          </motion.div>

          {/* ── Right: solution copy ─────────────────────────────────────────── */}
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
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-600">
                The Solution
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={0.1}
              className="display-section text-[clamp(1.75rem,4vw,3rem)] text-stone-900 mb-6 leading-tight"
            >
              {content.solutionHeadline}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="text-[15px] text-stone-500 font-light leading-relaxed mb-8"
            >
              {content.solutionBody}
            </motion.p>

            {/* How it works — numbered steps */}
            <div className="space-y-6">
              {content.howItWorks.map((step, i) => (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  custom={0.3 + i * 0.08}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-600 flex items-center justify-center">
                    <span className="text-white text-[11px] font-semibold">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-stone-900 mb-1 uppercase tracking-wide">
                      {step.title}
                    </p>
                    <p className="text-[13px] text-stone-500 font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Confirmation line */}
            <motion.div
              variants={fadeUp}
              custom={0.3 + content.howItWorks.length * 0.08 + 0.1}
              className="flex items-center gap-3 mt-8 pt-6 border-t border-stone-200"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-[13px] text-stone-500 font-light">
                Trusted by over 50,000 homeowners across 18 countries.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
