"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";
import { ArrowRight, Check } from "lucide-react";


export default function NewsletterSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section ref={ref} className="bg-stone-950 py-28 sm:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-5"
            >
              Join 50,000+ Smart Homeowners
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
              className="display-section text-[clamp(2rem,4.5vw,3.5rem)] text-white mb-6"
            >
              Home tips & new solutions,<br />
              <em className="italic text-amber-300/80">twice a month.</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-stone-400 font-light leading-relaxed max-w-sm"
            >
              Join 50,000 homeowners who get our curated picks — organising
              guides, new arrivals, and exclusive member discounts.
              Plus 10% off your first order.
            </motion.p>
          </div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex items-center gap-4 py-6"
              >
                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium mb-0.5">You're in.</p>
                  <p className="text-stone-400 text-sm">
                    Check your inbox for your 10% welcome discount.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-0 border border-white/15 focus-within:border-white/30 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex-1 bg-transparent px-5 py-4 text-white placeholder:text-stone-600 text-sm focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ backgroundColor: "#92400e" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-amber-700 text-white px-7 py-4 text-sm font-medium tracking-wide flex items-center gap-2 justify-center flex-shrink-0 whitespace-nowrap"
                    style={{ transition: "background-color 0.3s ease" }}
                  >
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
                <p className="text-[11px] text-stone-600">
                  No spam. Unsubscribe anytime. Read our{" "}
                  <a href="#" className="text-stone-400 underline underline-offset-2 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            )}

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["EC", "MA", "LT", "RK"].map((init, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-stone-700 border-2 border-stone-950 flex items-center justify-center text-[9px] font-medium text-stone-300"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-500">
                <span className="text-stone-300 font-medium">50,000+</span> subscribers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
