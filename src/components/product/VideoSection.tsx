"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { VideoPlaceholder } from "@/lib/product-content";
import { EASE, VIEW_ONCE, fadeUp, stagger } from "@/lib/motion";

interface Props {
  video: VideoPlaceholder;
  productName: string;
}

export default function VideoSection({ video, productName }: Props) {
  const [played, setPlayed] = useState(false);

  return (
    <section
      className="bg-stone-950 py-24 sm:py-32 px-6 sm:px-8 lg:px-12"
      aria-label="Product video"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEW_ONCE}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 mb-3"
          >
            See It In Action
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="display-section text-[clamp(2rem,5vw,3.75rem)] text-white mb-4"
          >
            Watch it <em>work.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-[15px] text-stone-400 font-light"
          >
            {video.caption}
          </motion.p>
        </motion.div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW_ONCE}
          transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
        >
          {/*
           * ══════════════════════════════════════════════════════════════════════
           * TikTok / Instagram Reels INTEGRATION POINT
           * ──────────────────────────────────────────────────────────────────────
           * STEP 1 — Replace the placeholder thumbnail with an embed:
           *
           *   TikTok embed:
           *   <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@user/video/id"
           *     data-video-id="VIDEO_ID">
           *     <section />
           *   </blockquote>
           *   <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
           *
           *   OR for full control, use a native <video> element:
           *   <video src={video.src} poster={video.thumbnailImage} controls />
           *
           * STEP 2 — Attach the video URL to each product in product-content.ts:
           *   video: { src: "https://...", thumbnailImage: "...", caption: "...", duration: "..." }
           *
           * STEP 3 — Remove the "played" state and the overlay below.
           * ══════════════════════════════════════════════════════════════════════
           */}
          <div
            className="relative aspect-video bg-stone-900 overflow-hidden cursor-pointer group rounded-lg"
            onClick={() => setPlayed(true)}
            role="button"
            tabIndex={0}
            aria-label={`Play video: ${productName}`}
            onKeyDown={(e) => e.key === "Enter" && setPlayed(true)}
          >
            {/* Thumbnail */}
            <Image
              src={video.thumbnailImage}
              alt={`${productName} video thumbnail`}
              fill
              className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 960px"
            />

            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <Play className="h-6 w-6 text-stone-900 fill-stone-900 ml-0.5" />
              </motion.div>

              {played && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[13px] text-white/60 font-light"
                >
                  Video coming soon — check our{" "}
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    TikTok
                  </a>{" "}
                  in the meantime.
                </motion.p>
              )}
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-stone-950/70 backdrop-blur-sm px-2.5 py-1">
              <Clock className="h-3 w-3 text-stone-400" aria-hidden="true" />
              <span className="text-[11px] text-stone-400">{video.duration}</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
