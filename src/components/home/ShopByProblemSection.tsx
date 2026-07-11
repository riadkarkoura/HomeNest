"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, VIEW_ONCE, fadeUp } from "@/lib/motion";

// ─── Data ────────────────────────────────────────────────────────────────────
// AI INTEGRATION POINT ────────────────────────────────────────────────────────
// In the future this list will be dynamically generated based on:
//   - Most common search queries (from AI Smart Search logs)
//   - Product catalog problem mappings (Product.problemSolved field)
//   - Seasonal or trending home issues
// Current: static curated list
// ─────────────────────────────────────────────────────────────────────────────

interface Problem {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "water-splashing",
    title: "Stop Water Splashing",
    description:
      "Keep your countertops dry. No more puddles, no more wiping up after every wash.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    href: "/products?category=Kitchen",
  },
  {
    id: "small-spaces",
    title: "Organize Small Spaces",
    description:
      "Double your storage without renovating a thing. Smart organisers that fit anywhere.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    href: "/products?category=Storage",
  },
  {
    id: "kitchen-clutter",
    title: "Declutter Your Kitchen",
    description:
      "A tidy kitchen changes the whole feel of your home. Start with the drawers.",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    href: "/products?category=Kitchen",
  },
  {
    id: "bathroom-storage",
    title: "Bathroom Storage",
    description:
      "Clear surfaces, calm mornings. The right shelf makes all the difference.",
    image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=600&q=80",
    href: "/products?category=Bathroom",
  },
  {
    id: "cleaning",
    title: "Cleaning Made Easy",
    description:
      "The right tools make even the worst chores feel genuinely effortless.",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
    href: "/products?category=Cleaning",
  },
  {
    id: "cable-management",
    title: "Cable Management",
    description:
      "One tangled cable ruins the whole look of a room. Fix it in minutes.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    href: "/products",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ShopByProblemSection() {
  return (
    <section
      className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 bg-[#FAFAF8]"
      aria-label="Shop by Problem"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW_ONCE}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
            >
              Shop by Problem
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW_ONCE}
              transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
              className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
            >
              Start from the <em>problem.</em>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW_ONCE}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 group transition-colors duration-200"
            >
              View all solutions
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* ── Cards grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map((problem, index) => (
            <ProblemCard key={problem.id} problem={problem} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Problem Card ─────────────────────────────────────────────────────────────

function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-lg overflow-hidden shadow-sm"
    >
      <Link href={problem.href} className="block">

        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4/3" }}
        >
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <Image
              src={problem.image}
              alt={problem.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="display-section text-[1.35rem] text-stone-900 group-hover:text-amber-700 transition-colors duration-300 mb-2 leading-snug">
            {problem.title}
          </h3>
          <p className="text-[13px] text-stone-400 leading-relaxed mb-5">
            {problem.description}
          </p>
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-medium text-amber-700 group-hover:text-amber-900 transition-colors duration-200">
            Find solutions
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>

      </Link>
    </motion.div>
  );
}
