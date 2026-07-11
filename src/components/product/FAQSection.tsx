"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  faqs: FAQ[];
}

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-stone-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-[15px] font-medium leading-snug transition-colors duration-200 ${
            isOpen ? "text-amber-700" : "text-stone-900 group-hover:text-stone-700"
          }`}
        >
          {faq.question}
        </span>
        <span className="flex-shrink-0 w-5 h-5 mt-0.5">
          {isOpen ? (
            <Minus className="h-5 w-5 text-amber-600" />
          ) : (
            <Plus className="h-5 w-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
          )}
        </span>
      </button>

      {/*
       * Accordion — uses CSS grid trick to animate row height
       * without animating `height` directly (per design system rule).
       */}
      <motion.div
        animate={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        initial={false}
        transition={{ duration: 0.35, ease: EASE }}
        className="grid overflow-hidden"
      >
        <div className="min-h-0">
          <p className="text-[14px] text-stone-500 font-light leading-relaxed pb-5">
            {faq.answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function FAQSection({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      className="bg-white py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="mb-12"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
          >
            Common <em>questions.</em>
          </motion.h2>
        </motion.div>

        {/* Accordion list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW_ONCE}
          transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
          className="border-t border-stone-200"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
