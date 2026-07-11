"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";
import { ArrowUpRight } from "lucide-react";
import { VIEW_ONCE } from "@/lib/motion";


const categories = [
  {
    name: "Kitchen",
    tagline: "Cook smarter, not harder",
    href: "/products?category=Kitchen",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1000&q=85",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/3] lg:aspect-auto lg:h-full",
  },
  {
    name: "Bathroom",
    tagline: "Calm starts here",
    href: "/products?category=Bathroom",
    image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=85",
    span: "lg:col-span-1",
    aspect: "aspect-[4/3]",
  },
  {
    name: "Storage",
    tagline: "A place for everything",
    href: "/products?category=Storage",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85",
    span: "lg:col-span-1",
    aspect: "aspect-[4/3]",
  },
];

export default function CategorySection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-3"
            >
              Browse by Need
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
              className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
            >
              Find your fix.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors group"
            >
              View all solutions
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-3 lg:h-[640px]">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
              className={`${cat.span} group relative overflow-hidden bg-stone-200`}
            >
              <Link href={cat.href} className="block h-full">
                <div className={`relative ${cat.aspect} h-full`}>
                  {/* Background image with hover parallax */}
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </motion.div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Text block */}
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    {/* Category number */}
                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-3 block">
                      0{i + 1}
                    </span>

                    <motion.h3
                      className="display-section text-[clamp(1.5rem,3vw,2.25rem)] text-white mb-1"
                      initial={{ y: 0 }}
                    >
                      {cat.name}
                    </motion.h3>

                    {/* Tagline slides up on hover */}
                    <div className="overflow-hidden h-5">
                      <motion.p
                        className="text-sm text-stone-300 font-light flex items-center gap-2"
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        {cat.tagline}
                        <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
                      </motion.p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
