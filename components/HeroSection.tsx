"use client";

/**
 * ST·SURFERS — HERO SECTION
 * ─────────────────────────────────────────────────────────────────────────
 * Full 100vh cinematic hero with Framer Motion staggered reveal.
 *
 * Background layers (back → front):
 *   [0] Dark base (#000)
 *   [1] Optional looping video (desktop only — md+)
 *   [2] Gradient overlay (dark top + dark bottom, lighter centre)
 *   [3] Map texture overlay
 *   [4] Atmospheric red glow (bottom-right radial)
 *   [5] Bottom bleed → next section
 *   [6] Decorative: car-arc watermark + location pin accents
 *   [10] Main content + scroll indicator
 *
 * Props:
 *   onWaitlistClick — opens the waitlist modal (passed down from page.tsx)
 *   videoSrc        — optional Pexels/CDN video URL
 *                     Recommended search: "johannesburg highway night"
 *                     Leave undefined to use gradient + texture fallback.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onWaitlistClick: () => void;
  /**
   * Optional background video URL (e.g. from Pexels CDN).
   * Search Pexels for: "johannesburg highway night" or "south africa traffic night"
   * Video only renders on md+ breakpoints; mobile shows gradient + texture.
   */
  videoSrc?: string;
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, delay, ease: EASE },
    },
  };
}

function fadeIn(delay: number): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, delay, ease: "easeOut" as const },
    },
  };
}

// ─── Copy variants (A/B test options — swap out the active set below) ─────────
//
// Option A (active): "South side rides, sorted." — direct, geographical
//   Sub: "Scheduled shuttle transport for staff and scholars across Joburg.
//         Fixed prices. No surge. No surprises."
//
// Option B: "Joburg commute, cracked."
//   Sub: "No surge. No stress. Just your ride, ready."
//
// Option C: "School run. Work run. All run."
//   Sub: "Staff and scholar transport built for daily Joburg life."
//
// Badge options:
//   A (active): "🔴 Pre-launch · JHB South Side — Secure your spot"
//   B:          "🚀 Launching in Johannesburg — Get Early Access"
// ─────────────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  "Background-checked drivers",
  "Fixed prices — zero surge",
  "Scholar-safe routes",
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection({ onWaitlistClick, videoSrc }: HeroSectionProps) {
  const [scrolled, setScrolled] = useState(false);
  const shouldReduce = useReducedMotion();

  // Scroll indicator disappears after 300px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToHowItWorks = () =>
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });

  // When prefers-reduced-motion, skip stagger — everything appears immediately
  const fu = (delay: number): Variants =>
    shouldReduce
      ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
      : fadeUp(delay);

  const fi = (delay: number): Variants =>
    shouldReduce
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      : fadeIn(delay);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-ss-black"
      aria-label="Hero — South side rides, sorted"
    >
      {/* ── LAYER 1: Background video (desktop only, fades in on load) ──── */}
      {videoSrc && (
        <motion.div
          className="absolute inset-0 hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            poster="/assets/video/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          />
        </motion.div>
      )}

      {/* ── LAYER 2: Gradient overlay ────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.92) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── LAYER 3: Map texture ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-[2] bg-map-texture"
        style={{ opacity: videoSrc ? 0.22 : 0.55 }}
        aria-hidden="true"
      />

      {/* ── LAYER 4: Atmospheric red glow (bottom-right) ─────────────────── */}
      <div
        className="absolute -bottom-24 -right-24 w-[700px] h-[700px] z-[2] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(208,28,0,0.16) 0%, transparent 62%)",
        }}
        aria-hidden="true"
      />

      {/* ── LAYER 5: Bottom bleed into next section ──────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-52 z-[3] pointer-events-none"
        style={{ background: "linear-gradient(to top, #000000 0%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* ── LAYER 6a: Brand car-arc watermark (bottom-right, 3% opacity) ── */}
      <div
        className="absolute -bottom-16 -right-10 w-[520px] h-[520px] pointer-events-none select-none z-[4]"
        style={{ opacity: 0.032 }}
        aria-hidden="true"
      >
        <CarArcIcon />
      </div>

      {/* ── LAYER 6b: Red location pin accents (slow pulse) ──────────────── */}
      <div
        className="absolute top-[20%] right-[9%] z-[4] pointer-events-none animate-pulse"
        aria-hidden="true"
      >
        <LocationPin size={18} opacity={0.45} />
      </div>
      <div
        className="absolute top-[60%] right-[27%] z-[4] pointer-events-none animate-pulse [animation-delay:900ms]"
        aria-hidden="true"
      >
        <LocationPin size={11} opacity={0.28} />
      </div>
      <div
        className="absolute top-[38%] right-[42%] z-[4] pointer-events-none animate-pulse [animation-delay:1500ms]"
        aria-hidden="true"
      >
        <LocationPin size={14} opacity={0.35} />
      </div>

      {/* ── LAYER 6c: Large atmospheric pins — very low opacity, slow float ── */}
      {/* Pure atmosphere; opacity 0.035–0.055, 76–112px scale */}
      <div
        className="absolute top-[28%] left-[6%] z-[3] pointer-events-none select-none animate-float"
        style={{ opacity: 0.052 }}
        aria-hidden="true"
      >
        <LocationPin size={92} opacity={1} />
      </div>
      <div
        className="absolute bottom-[26%] right-[3%] z-[3] pointer-events-none select-none animate-float"
        style={{ opacity: 0.044, animationDelay: "1.4s", animationDirection: "alternate-reverse" }}
        aria-hidden="true"
      >
        <LocationPin size={112} opacity={1} />
      </div>
      <div
        className="absolute top-[54%] left-[33%] z-[3] pointer-events-none select-none animate-float"
        style={{ opacity: 0.036, animationDelay: "0.7s" }}
        aria-hidden="true"
      >
        <LocationPin size={76} opacity={1} />
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="container-site relative z-10 pt-24 pb-20 w-full">
        <div className="max-w-[700px] mx-auto md:mx-0 text-center md:text-left">

          {/* 1 · Pre-launch badge — 0.2s */}
          <motion.div
            variants={fi(0.2)}
            initial="hidden"
            animate="visible"
            className="inline-flex mb-8"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-ss-red font-body text-sm font-medium"
              style={{ border: "1px solid #D01C00" }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#D01C00" }}
                aria-hidden="true"
              />
              Pre-launch · JHB South Side — Secure your spot
            </span>
          </motion.div>

          {/* 2 · H1 — each line slides up independently */}
          {/* Line 1: 0.4s | Line 2: 0.55s (0.15s stagger) */}
          <h1
            className="font-display font-extrabold leading-[1.02] tracking-[-0.01em] mb-6"
            style={{ fontSize: "clamp(2.625rem, 8vw, 5.5rem)" }}
          >
            <motion.span
              variants={fu(0.4)}
              initial="hidden"
              animate="visible"
              className="block text-ss-white"
            >
              South side rides,
            </motion.span>
            <motion.span
              variants={fu(0.55)}
              initial="hidden"
              animate="visible"
              className="block text-ss-red"
            >
              sorted.
            </motion.span>
          </h1>

          {/* 3 · Sub-headline — 0.7s */}
          <motion.p
            variants={fu(0.7)}
            initial="hidden"
            animate="visible"
            className="font-body text-xl leading-relaxed mb-10 max-w-[520px] mx-auto md:mx-0 text-white/70"
          >
            Scheduled transport for staff and scholars across Joburg.{" "}
            <span className="block md:inline">Your fare is fixed. Your seat is booked. Always.</span>
          </motion.p>

          {/* 4 · CTA buttons — 0.9s */}
          <motion.div
            variants={fi(0.9)}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            {/* Primary — Join the Waitlist */}
            <button
              onClick={onWaitlistClick}
              className="rounded bg-ss-red hover:bg-ss-red-dark text-ss-white font-display font-bold px-8 py-4 text-base transition-all duration-200 hover:scale-[1.03] hover:shadow-red-glow w-full sm:w-auto"
            >
              Join the Waitlist
            </button>

            {/* Ghost — See How It Works */}
            <button
              onClick={scrollToHowItWorks}
              className="rounded border border-[rgba(255,255,255,0.4)] hover:border-ss-red text-white hover:text-ss-red bg-transparent font-body font-medium px-8 py-4 text-base transition-all duration-200 w-full sm:w-auto"
            >
              See How It Works →
            </button>
          </motion.div>

          {/* 5 · Trust bar — 1.1s */}
          <motion.div
            variants={fi(1.1)}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center md:justify-start gap-x-7 gap-y-3"
          >
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 font-body text-sm text-white/55"
              >
                <CheckIcon />
                {item}
              </span>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ── SCROLL INDICATOR ─────────────────────────────────────────────── */}
      {/* Appears at 1.6s, disappears on 300px scroll */}
      <AnimatePresence>
        {!scrolled && !shouldReduce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.6, duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
            aria-hidden="true"
          >
            <span className="font-body text-[0.625rem] font-medium uppercase tracking-[0.18em] text-white/35">
              scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDownIcon />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocationPin({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.4)}
      viewBox="0 0 20 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.477 15.523 0 10 0z"
        fill="#D01C00"
        fillOpacity={opacity}
      />
      <circle
        cx="10"
        cy="10"
        r="3.5"
        fill="#D01C00"
        fillOpacity={Math.min(opacity * 1.8, 1)}
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <path
        d="M2.5 8l3.5 3.5 6.5-6.5"
        stroke="#D01C00"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="text-white/35"
      aria-hidden="true"
    >
      <path
        d="M5 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CarArcIcon() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Car body — sedan silhouette */}
      <path
        d="M30 145 L44 108 Q65 70 122 60 Q150 55 178 60 Q235 70 256 108 L270 145 L270 165 Q270 176 260 176 L40 176 Q30 176 30 165 Z"
        fill="white"
      />
      {/* Windshield / windows */}
      <path
        d="M72 143 Q94 100 128 90 L172 90 Q206 100 228 143 Z"
        fill="black"
        fillOpacity="0.28"
      />
      {/* Wheels */}
      <circle cx="88" cy="176" r="24" fill="white" />
      <circle cx="88" cy="176" r="10" fill="black" fillOpacity="0.45" />
      <circle cx="212" cy="176" r="24" fill="white" />
      <circle cx="212" cy="176" r="10" fill="black" fillOpacity="0.45" />
      {/* Route dashed line — pickup to dropoff */}
      <line
        x1="90"
        y1="206"
        x2="210"
        y2="206"
        stroke="white"
        strokeWidth="3"
        strokeDasharray="10 7"
        strokeLinecap="round"
      />
      {/* Location pin A (pickup) */}
      <path
        d="M90 194C90 186 80 185 80 194C80 204 90 214 90 214C90 214 100 204 100 194C100 185 90 186 90 194Z"
        fill="white"
      />
      <circle cx="90" cy="194" r="4" fill="black" fillOpacity="0.4" />
      {/* Location pin B (dropoff) */}
      <path
        d="M210 194C210 186 200 185 200 194C200 204 210 214 210 214C210 214 220 204 220 194C220 185 210 186 210 194Z"
        fill="white"
      />
      <circle cx="210" cy="194" r="4" fill="black" fillOpacity="0.4" />
    </svg>
  );
}
