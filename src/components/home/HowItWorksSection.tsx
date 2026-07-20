"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, Sparkles, Compass, PackageCheck } from "lucide-react";
import { EASE, VIEW_ONCE } from "@/lib/motion";

// Sprint 9.3: replaces the old Philosophy section (a mission statement)
// with a walkthrough of the actual mechanism -- for visitors who scroll
// past the AI Consultant section without using it yet. See
// docs/LANDING_PAGE_EXPERIENCE.md §5-6.
const STEPS = [
  {
    icon: MessageCircle,
    title: "Describe",
    description: "Tell us what's actually frustrating you, in your own words -- no forms, no categories to guess at first.",
  },
  {
    icon: Sparkles,
    title: "Understand",
    description: "We reflect your problem back, so you know we heard exactly what you said before anything else happens.",
  },
  {
    icon: Compass,
    title: "Strategy",
    description: "A short, honest explanation of the approach that tends to work for a problem like yours.",
  },
  {
    icon: PackageCheck,
    title: "Recommend",
    description: "The specific products behind that strategy -- never shown without the problem they solve.",
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
          >
            Solve first. Shop second.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              className="text-center sm:text-left"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-amber-50 text-amber-600 mb-5">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">
                Step 0{i + 1}
              </p>
              <h3 className="text-[15px] font-medium text-stone-900 mb-2">
                {title}
              </h3>
              <p className="text-[13px] text-stone-500 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
