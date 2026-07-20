"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, Quote } from "lucide-react";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";
import { getProducts } from "@/lib/supabase/queries/products";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";

// ─── Data ────────────────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  "My sink gets wet.",
  "I need more kitchen storage.",
  "My bathroom is too small.",
  "I hate messy drawers.",
  "I need better cable organization.",
];

const CHIPS = ["Kitchen", "Bathroom", "Cleaning", "Storage"];

// Sprint 9.3: every line here is existing, already-shipped copy reused
// from CategorySection.tsx and ShopByProblemSection.tsx -- nothing here
// is a fabricated "AI analysis." It's an honest, short bridge from "here's
// what you told us" to "here's what tends to help" -- see
// docs/LANDING_PAGE_EXPERIENCE.md §6's hard constraint on this section.
const STRATEGY_BY_CATEGORY: Record<string, string> = {
  Kitchen: "Cook smarter, not harder.",
  Bathroom: "Calm starts here.",
  Storage: "A place for everything.",
  Cleaning: "The right tools make even the worst chores feel genuinely effortless.",
};
const STRATEGY_FALLBACK = "Here's what tends to help.";

type Step = "describe" | "results";

// ─────────────────────────────────────────────────────────────────────────────

export default function AIConsultantSection() {
  const [step, setStep] = useState<Step>("describe");
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [matches, setMatches] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Rotate placeholder every 2.5s -- pauses while the user types or focuses
  useEffect(() => {
    if (value || isFocused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2500);
    return () => clearInterval(id);
  }, [value, isFocused]);

  // Sprint 9.3: this is the whole "AI Consultant" experience today --
  // the same keyword match Sprint 9.1 built for /products?q=, run inline
  // instead of navigating away, so the section can show an "understanding"
  // and "strategy" moment before the products appear. No AI backend exists
  // yet, per explicit instruction -- see the copy constraint above.
  const runConsultation = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setSubmittedQuery(trimmed);
    const results = await getProducts({ q: trimmed });
    setMatches(results);
    setLoading(false);
    setStep("results");
  };

  const reset = () => {
    setStep("describe");
    setValue("");
    setSubmittedQuery("");
    setMatches([]);
  };

  const dominantCategory = (() => {
    if (matches.length === 0) return null;
    const counts = new Map<string, number>();
    for (const m of matches) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  })();
  const strategyLine = dominantCategory
    ? STRATEGY_BY_CATEGORY[dominantCategory] ?? STRATEGY_FALLBACK
    : STRATEGY_FALLBACK;

  return (
    <section
      id="ai-consultant"
      className="bg-[#FAFAF8] py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="AI Home Consultant"
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 mb-5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-600">
              AI Home Consultant
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900 mb-4"
          >
            What&apos;s your home <em>problem?</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-[15px] text-stone-500 font-light max-w-md mx-auto leading-relaxed"
          >
            Describe it in your own words. We&apos;ll recommend a strategy
            and the products for it.
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "describe" ? (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runConsultation(value);
                }}
              >
                <div
                  className={`flex items-center gap-4 border px-6 py-5 transition-all duration-300 ${
                    isFocused
                      ? "bg-white border-amber-500/50"
                      : "bg-white border-stone-200"
                  }`}
                >
                  <Search
                    className="h-5 w-5 text-stone-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex-1 relative flex items-center min-h-[32px]">
                    <input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="w-full bg-transparent text-stone-900 text-lg sm:text-xl font-light focus:outline-none placeholder:opacity-0 caret-amber-600 relative z-10"
                      placeholder=" "
                      aria-label="Describe your household problem"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <AnimatePresence mode="wait">
                      {!value && !isFocused && (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="absolute left-0 pointer-events-none text-stone-400 text-lg sm:text-xl font-light"
                          aria-hidden="true"
                        >
                          {PLACEHOLDERS[idx]}
                        </motion.span>
                      )}
                      {!value && isFocused && (
                        <motion.span
                          key="typing-hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 pointer-events-none text-stone-300 text-lg sm:text-xl font-light"
                          aria-hidden="true"
                        >
                          Start typing…
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] font-medium inline-flex items-center gap-2 transition-colors duration-200"
                    aria-label="Get my strategy"
                  >
                    <span className="hidden sm:inline">
                      {loading ? "Thinking…" : "Get My Strategy"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </form>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW_ONCE}
                transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
                className="flex flex-wrap gap-2.5 mt-6 justify-center"
                role="list"
                aria-label="Example problems"
              >
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    role="listitem"
                    onClick={() => runConsultation(chip)}
                    className="px-4 py-2 rounded-full text-[13px] font-medium text-stone-500 border border-stone-200 hover:border-amber-500/40 hover:text-amber-700 transition-all duration-200"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {/* Understanding -- echoes the visitor's own words back */}
              <div className="flex items-start gap-3 mb-8 text-stone-500">
                <Quote className="h-4 w-4 mt-1 flex-shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed">
                  You told us: <span className="text-stone-900 font-medium">&ldquo;{submittedQuery}&rdquo;</span>
                </p>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-white">
                  <p className="text-stone-500 mb-4">
                    We couldn&apos;t match that to a specific solution yet.
                  </p>
                  <Link
                    href="/products"
                    className="text-amber-700 hover:text-amber-900 text-sm font-medium underline underline-offset-2"
                  >
                    Browse the full collection
                  </Link>
                </div>
              ) : (
                <>
                  {/* Strategy */}
                  <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-2">
                      Our recommendation
                    </p>
                    <p className="display-section text-2xl sm:text-3xl text-stone-900">
                      {strategyLine}
                    </p>
                  </div>

                  {/* Recommended products */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {matches.slice(0, 3).map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>

                  {matches.length > 3 && (
                    <div className="text-center mb-4">
                      <Link
                        href={`/products?q=${encodeURIComponent(submittedQuery)}`}
                        className="text-amber-700 hover:text-amber-900 text-sm font-medium underline underline-offset-2"
                      >
                        See all {matches.length} matching solutions
                      </Link>
                    </div>
                  )}
                </>
              )}

              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={reset}
                  className="text-stone-400 hover:text-stone-700 text-sm transition-colors"
                >
                  Describe another problem
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
