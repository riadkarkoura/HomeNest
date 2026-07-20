"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { EASE } from "@/lib/motion";

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "50k+", label: "Homes upgraded"   },
  { value: "18",   label: "Countries served" },
  { value: "30",   label: "Day free returns" },
  { value: "4.9",  label: "Average rating"   },
];

// ─── Stagger timings (all relative to mount) ────────────────────────────────
const COPY_DELAYS = { eyebrow: 0.6, h1: 0.75, body: 0.95, ctas: 1.1, stats: 1.25 };

// ─── Film-grain texture (SVG feTurbulence, ~120 bytes, no external file) ────
const GRAIN_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Trigger Ken Burns sequence after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Scroll parallax ────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Background rises slower than scroll; text rises faster (depth split)
  const bgScrollY      = useTransform(scrollYProgress, [0, 1], ["0%",  "22%"]);
  const textScrollY    = useTransform(scrollYProgress, [0, 1], ["0%",  "14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // ── Mouse parallax ─────────────────────────────────────────────────────────
  // Raw motion values (0 → 1 across the section)
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  // Spring-dampen so movement feels weighted, not instant
  const springX = useSpring(rawX, { stiffness: 28, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 28, damping: 22 });

  // Background shifts ±10px — very subtle depth nudge
  const bgMouseX = useTransform(springX, [0, 1], ["-10px", "10px"]);
  const bgMouseY = useTransform(springY, [0, 1], ["-7px",  "7px" ]);

  // Light bloom drifts in the *opposite* direction → feels like it's farther back
  const bloomLeft = useTransform(springX, [0, 1], ["53%", "47%"]);
  const bloomTop  = useTransform(springY, [0, 1], ["28%", "38%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } =
      sectionRef.current!.getBoundingClientRect();
    rawX.set((e.clientX - left) / width);
    rawY.set((e.clientY - top)  / height);
  };

  const handleMouseLeave = () => {
    rawX.set(0.5);
    rawY.set(0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-[100svh] min-h-[660px] flex flex-col overflow-hidden bg-stone-900"
      aria-label="Hero"
    >
      {/*
       * ════════════════════════════════════════════════════════════════════════
       *  REACT THREE FIBER INTEGRATION POINT
       * ────────────────────────────────────────────────────────────────────────
       *  STEP 1 — install:
       *    npm install three @react-three/fiber @react-three/drei
       *
       *  STEP 2 — replace the <Image> block inside #hero-3d-canvas with:
       *
       *    import { Canvas, useFrame } from '@react-three/fiber'
       *    import { Environment, Float, useGLTF } from '@react-three/drei'
       *
       *    <Canvas
       *      camera={{ position: [0, 0, 4.5], fov: 42 }}
       *      dpr={[1, 2]}
       *      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
       *      style={{ position: 'absolute', inset: 0 }}
       *    >
       *      <ambientLight intensity={0.4} />
       *      <directionalLight position={[3, 6, 2]} intensity={1.2} />
       *      <Environment preset="apartment" />
       *      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
       *        <YourFurnitureModel />
       *      </Float>
       *    </Canvas>
       *
       *  STEP 3 — to sync mouse parallax with your R3F scene, read springX/springY
       *    inside a useFrame hook and map them to camera.position.x / .y.
       *    The values are already spring-smoothed so no additional damping needed.
       *
       *  KEEP: id="hero-3d-canvas", className, z-0, pointer-events-none
       * ════════════════════════════════════════════════════════════════════════
       */}
      <div
        id="hero-3d-canvas"
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {/* ── Layer 1: Image (scroll-Y + mouse-XY + Ken Burns zoom) ── */}
        <motion.div
          style={{ y: bgScrollY }}
          className="absolute inset-0"
        >
          <motion.div
            style={{ x: bgMouseX, y: bgMouseY, willChange: "transform" }}
            // Ken Burns: zooms from 1.12 → 1.06 on load, stays at 1.06 after
            animate={{ scale: loaded ? 1.06 : 1.12 }}
            transition={{ duration: 2.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-[-4%]"
          >
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&q=85"
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </motion.div>
        </motion.div>

        {/* ── Layer 2: Film grain (SVG feTurbulence, ~3% opacity) ── */}
        <div
          className="absolute inset-0 opacity-[0.032] mix-blend-overlay"
          style={{
            backgroundImage:  `url("${GRAIN_SRC}")`,
            backgroundRepeat: "repeat",
            backgroundSize:   "192px 192px",
          }}
        />

        {/* ── Layer 3: Gradient vignettes ── */}
        {/* Sprint 9.3: softened from a near-black cinematic vignette to a
            warm gradient -- kept only strong enough for text legibility,
            per docs/LANDING_PAGE_EXPERIENCE.md's "avoid the heavy dark
            feeling" decision. */}
        {/* Bottom: keeps the stats bar readable without a heavy dark base */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/35 to-transparent" />
        {/* Left: anchors the text side, softened */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/55 via-stone-900/15 to-transparent" />
        {/* Top: subtle fade so the transparent navbar doesn't fight the image */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-900/25 to-transparent" />
        {/* Corner vignettes: softened for warmth over cinema depth */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 100% 0%, #1c191700 60%, #1c1917 100%)," +
              "radial-gradient(ellipse 60% 60% at 100% 100%, #1c191700 50%, #1c1917 100%)",
          }}
        />

        {/* ── Layer 4: Light bloom (mouse-reactive, warm amber) ── */}
        <motion.div
          style={{ left: bloomLeft, top: bloomTop }}
          className="absolute pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="w-[70vw] h-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, " +
                "rgba(251,191,36,0.10) 0%, " +
                "rgba(180,83,9,0.06)  35%, " +
                "transparent          68%)",
              filter: "blur(40px)",
            }}
          />
        </motion.div>

        {/* ── Layer 5: Horizontal light split (top-left highlight) ── */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 12% 35%, rgba(255,245,230,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Hero content ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: textScrollY, opacity: contentOpacity }}
        className="relative z-10 flex flex-col justify-center flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-14 pt-20"
      >
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: COPY_DELAYS.eyebrow, ease: EASE }}
            className="flex items-center gap-3 mb-9"
          >
            <span className="block w-5 h-px bg-amber-500/70" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-amber-400/75 font-light">
              Smart Home · Everyday Solutions
            </span>
          </motion.div>

          {/* Display headline — Cormorant, fluid clamp */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: COPY_DELAYS.h1, ease: EASE }}
            className="display-hero text-[clamp(3.25rem,8.5vw,8rem)] text-white leading-[0.93] mb-8 tracking-[-0.02em]"
          >
            Your home,<br />
            <em className="italic" style={{ color: "rgba(253,230,138,0.88)" }}>
              smarter.
            </em>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: COPY_DELAYS.body, ease: EASE }}
            className="text-[15px] text-stone-400 max-w-[360px] leading-[1.75] mb-11 font-light"
          >
            Clever products that solve real household problems.
            Less clutter. More calm. A home that actually works.
          </motion.p>

          {/* ── CTAs — clear primary / secondary hierarchy ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: COPY_DELAYS.ctas, ease: EASE }}
            className="flex flex-wrap items-center gap-5"
          >
            {/* Primary — leads into the AI Consultant section, not the
                catalog (Sprint 9.3, consultation-first decision) */}
            <Link href="#ai-consultant">
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                className="relative inline-flex items-center gap-3 overflow-hidden bg-white text-stone-950 px-8 py-[14px] text-[13px] font-medium tracking-[0.06em] uppercase"
              >
                {/* Shimmer sweep */}
                <motion.span
                  variants={{
                    hover: {
                      x: ["−110%", "210%"],
                      transition: { duration: 0.55, ease: "easeInOut" },
                    },
                  }}
                  className="pointer-events-none absolute inset-0 -skew-x-12"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
                  }}
                  aria-hidden
                />
                <span className="relative flex items-center gap-3">
                  Describe Your Problem
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            </Link>

            {/* Secondary — honestly relabeled: this always linked straight
                to the catalog, "How It Works" was a mislabel (see
                docs/UX_AUDIT.md) */}
            <Link href="/products">
              <motion.span
                className="group inline-flex items-center gap-2 text-[13px] text-white/55 hover:text-white/90 transition-colors duration-300 cursor-pointer tracking-wide relative"
                whileHover="hover"
              >
                Browse Solutions
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                {/* Underline slide */}
                <motion.span
                  variants={{
                    hover: { scaleX: 1 },
                  }}
                  initial={{ scaleX: 0 }}
                  className="absolute -bottom-px left-0 right-0 h-px bg-white/30 origin-left"
                  style={{ transition: "transform 0.3s ease" }}
                  aria-hidden
                />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 1 }}
        className="relative z-10 flex flex-col items-center gap-3 pb-9"
        aria-hidden="true"
      >
        {/* Classic "mouse" oval with bouncing dot */}
        <div className="w-[18px] h-[28px] rounded-full border border-white/20 flex items-start justify-center pt-[5px]">
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [0.9, 0.1, 0.9] }}
            transition={{
              repeat: Infinity,
              duration: 1.9,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="w-[3px] h-[6px] rounded-full bg-white/50"
          />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-stone-600">
          Scroll
        </span>
      </motion.div>

      {/* ── Decorative side label (desktop) ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute right-7 top-1/2 -translate-y-1/2 z-10 hidden xl:flex flex-col items-center gap-4 pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-14 w-px bg-white/10" />
        <span
          className="text-[9px] uppercase tracking-[0.35em] text-stone-600"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Est. 2019
        </span>
        <div className="h-14 w-px bg-white/10" />
      </motion.div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: COPY_DELAYS.stats, duration: 0.8, ease: EASE }}
        className="relative z-10 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4"
        aria-label="Brand highlights"
      >
        {STATS.map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: COPY_DELAYS.stats + i * 0.07,
              duration: 0.6,
              ease: EASE,
            }}
            className="group px-6 py-5 border-r border-white/[0.08] last:border-r-0 flex flex-col gap-0.5 hover:bg-white/[0.03] transition-colors duration-300"
          >
            <span className="display-section text-[1.45rem] text-white/85 group-hover:text-amber-300/80 transition-colors duration-500">
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-600">
              {label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
