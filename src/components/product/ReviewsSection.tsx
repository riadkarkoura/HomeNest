"use client";

import { motion } from "framer-motion";
import { Star, ThumbsUp, BadgeCheck } from "lucide-react";
import { DemoReview, ProductContent } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  reviews: DemoReview[];
  rating: number;
  reviewCount: number;
}

// Star breakdown — generate from demo reviews
function buildBreakdown(reviews: DemoReview[]): Record<number, number> {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating in counts) counts[r.rating]++;
  });
  return counts;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: DemoReview; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.1}
      className="bg-white p-6 rounded-lg shadow-sm border border-stone-100/80"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-semibold text-stone-600">{review.avatar}</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">{review.author}</p>
            <p className="text-[11px] text-stone-400">{review.location}</p>
          </div>
        </div>
        {review.verified && (
          <div className="flex items-center gap-1 text-amber-600">
            <BadgeCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide font-medium">Verified</span>
          </div>
        )}
      </div>

      {/* Stars + date */}
      <div className="flex items-center justify-between mb-3">
        <StarRow rating={review.rating} />
        <span className="text-[11px] text-stone-400">{review.date}</span>
      </div>

      {/* Title */}
      <p className="text-[14px] font-semibold text-stone-900 mb-2">{review.title}</p>

      {/* Body */}
      <p className="text-[13px] text-stone-500 font-light leading-relaxed mb-4">{review.body}</p>

      {/* Helpful */}
      <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
        <ThumbsUp className="h-3.5 w-3.5 text-stone-400" />
        <span className="text-[11px] text-stone-400">{review.helpful} people found this helpful</span>
      </div>
    </motion.div>
  );
}

export default function ReviewsSection({ reviews, rating, reviewCount }: Props) {
  const breakdown = buildBreakdown(reviews);
  const total = reviews.length || 1;

  return (
    <section
      className="bg-[#FAFAF8] py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Customer reviews"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="mb-14"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
          >
            Customer Reviews
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
          >
            What people <em>say.</em>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* ── Rating summary ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW_ONCE}
            transition={{ duration: 0.75, ease: EASE }}
          >
            {/* Big number */}
            <div className="flex items-end gap-3 mb-4">
              <span className="display-section text-[4rem] text-stone-900 leading-none">{rating}</span>
              <div className="pb-1.5">
                <StarRow rating={Math.round(rating)} />
                <p className="text-[12px] text-stone-400 mt-1">
                  Based on {reviewCount.toLocaleString()} reviews
                </p>
              </div>
            </div>

            {/* Star breakdown bars */}
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] ?? 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-500 w-3">{star}</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-stone-200 overflow-hidden rounded-full">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: pct / 100 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: (5 - star) * 0.06, ease: EASE }}
                        className="h-full bg-amber-400 origin-left"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <span className="text-[11px] text-stone-400 w-7 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Review cards ─────────────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEW_ONCE}
            variants={stagger}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5"
          >
            {reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
