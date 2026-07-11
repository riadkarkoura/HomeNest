"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";


const TESTIMONIALS = [
  {
    quote:
      "The sink splash guard sounds like a small thing — until you realise you've stopped wiping down the wall behind your tap five times a day. Worth every penny.",
    author: "Rachel Morrison",
    title: "Home organiser, Toronto",
    initials: "RM",
  },
  {
    quote:
      "I've reorganised our kitchen twice in ten years and never been happy. The under-sink rack and the lazy susan fixed what no renovation ever could.",
    author: "David Park",
    title: "Father of three, Sydney",
    initials: "DP",
  },
  {
    quote:
      "I ordered the shower caddy expecting nothing remarkable. Three months later it's still perfect — no rust, no wobble, exactly where I left it.",
    author: "Amara Osei",
    title: "Product designer, Amsterdam",
    initials: "AO",
  },
];

export default function TestimonialSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  return (
    <section ref={ref} className="py-24 sm:py-36 bg-[#FAFAF8] border-t border-stone-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-16 text-center"
        >
          What our customers say
        </motion.p>

        {/* Large quote mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="display-section text-[8rem] leading-none text-stone-200 select-none mb-2 text-center"
          aria-hidden
        >
          "
        </motion.div>

        {/* Quote */}
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-center"
          >
            <p className="display-section text-[clamp(1.15rem,2.5vw,1.6rem)] text-stone-800 leading-relaxed mb-10 max-w-3xl mx-auto">
              {TESTIMONIALS[active].quote}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-9 h-9 rounded-full bg-stone-900 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                {TESTIMONIALS[active].initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">{TESTIMONIALS[active].author}</p>
                <p className="text-xs text-stone-400">{TESTIMONIALS[active].title}</p>
              </div>
            </div>
          </motion.blockquote>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-6 h-1.5 bg-stone-900"
                  : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400"
              }`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
