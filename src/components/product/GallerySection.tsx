"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  images: string[];
  productName: string;
}

export default function GallerySection({ images, productName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <section
      className="bg-stone-50 py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Product gallery"
    >
      <div className="max-w-7xl mx-auto">

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
            Gallery
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-stone-900"
          >
            See every <em>detail.</em>
          </motion.h2>
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className={`grid gap-4 ${
            images.length === 1
              ? "grid-cols-1 max-w-2xl"
              : images.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {images.map((img, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i * 0.1}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square bg-stone-100 overflow-hidden cursor-zoom-in rounded-lg"
            >
              <Image
                src={img}
                alt={`${productName} — view ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Overlay hint */}
              <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/15 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {/* Index label */}
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-0.5">
                <span className="text-[10px] text-stone-700 font-medium">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-stone-950/92 flex items-center justify-center p-6"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Full-size image"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-5 right-5 p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="relative w-full max-w-3xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${productName} — view ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
