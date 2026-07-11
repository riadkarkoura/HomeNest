"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

// ─── Data ────────────────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  "My sink gets wet.",
  "I need more kitchen storage.",
  "My bathroom is too small.",
  "I hate messy drawers.",
  "I need better cable organization.",
];

const CHIPS = [
  { label: "Kitchen",      href: "/products?category=Kitchen"  },
  { label: "Bathroom",     href: "/products?category=Bathroom" },
  { label: "Cleaning",     href: "/products?category=Cleaning" },
  { label: "Storage",      href: "/products?category=Storage"  },
  { label: "Organization", href: "/products?category=Storage"  },
  { label: "Laundry",      href: "/products"                   },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function SmartSearchSection() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [idx, setIdx] = useState(0);

  // Rotate placeholder every 2.5 s — pauses while the user types or focuses
  useEffect(() => {
    if (value || isFocused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2500);
    return () => clearInterval(id);
  }, [value, isFocused]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    // AI INTEGRATION POINT ─────────────────────────────────────────────────────
    // Replace this navigate call with an API request to your AI search endpoint.
    //
    // Example future implementation:
    //   const results = await fetch("/api/ai-search", {
    //     method: "POST",
    //     body: JSON.stringify({ query }),
    //   }).then((r) => r.json());
    //   // then display results inline or route to a results page
    //
    // Expected response shape:
    //   { products: Product[], suggestions: string[], category?: Category }
    // ──────────────────────────────────────────────────────────────────────────
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section
      className="bg-stone-950 py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Smart Search"
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="text-center mb-12"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 mb-5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80">
              AI Smart Search
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-white mb-4"
          >
            What&apos;s your home <em>problem?</em>
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-[15px] text-stone-400 font-light max-w-md mx-auto leading-relaxed"
          >
            Describe it in your own words. We&apos;ll find the right solution.
          </motion.p>
        </motion.div>

        {/* ── Search box ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW_ONCE}
          transition={{ duration: 0.75, delay: 0.3, ease: EASE }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(value);
            }}
          >
            <div
              className={`flex items-center gap-4 border px-6 py-5 transition-all duration-300 ${
                isFocused
                  ? "bg-white/[0.09] border-amber-400/40"
                  : "bg-white/[0.06] border-white/10"
              }`}
            >
              <Search
                className="h-5 w-5 text-stone-500 flex-shrink-0"
                aria-hidden="true"
              />

              {/* Input + animated placeholder */}
              <div className="flex-1 relative flex items-center min-h-[32px]">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent text-white text-lg sm:text-xl font-light focus:outline-none placeholder:opacity-0 caret-amber-400 relative z-10"
                  placeholder=" "
                  aria-label="Describe your household problem"
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Animated rotating placeholder — hidden while typing or focused */}
                <AnimatePresence mode="wait">
                  {!value && !isFocused && (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute left-0 pointer-events-none text-stone-500 text-lg sm:text-xl font-light"
                      aria-hidden="true"
                    >
                      {PLACEHOLDERS[idx]}
                    </motion.span>
                  )}

                  {/* Focused idle state */}
                  {!value && isFocused && (
                    <motion.span
                      key="typing-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 pointer-events-none text-stone-600 text-lg sm:text-xl font-light"
                      aria-hidden="true"
                    >
                      Start typing…
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] font-medium inline-flex items-center gap-2 transition-colors duration-200"
                aria-label="Search for solutions"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* ── Quick problem chips ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW_ONCE}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          className="flex flex-wrap gap-2.5 mt-6 justify-center"
          role="list"
          aria-label="Browse by problem area"
        >
          {CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              role="listitem"
              className="px-4 py-2 rounded-full text-[13px] font-medium text-stone-400 border border-white/10 hover:border-amber-400/40 hover:text-amber-300 transition-all duration-200"
            >
              {chip.label}
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
