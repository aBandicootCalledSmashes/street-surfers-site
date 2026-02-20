"use client";

/**
 * ST·SURFERS — LOADING SCREEN
 * ──────────────────────────────────────────────────────────────────
 * Black overlay with:
 *  1. Car-arc SVG outline drawing in via pathLength animation
 *  2. Logo wordmark fading in (opacity + scale)
 *  3. Red progress bar filling at bottom (rAF-driven, max 1.5s)
 *  4. Fade-out exit via AnimatePresence
 *
 * Renders on top of page content (z-[200]). Content is already
 * rendered underneath — loader just conceals it briefly.
 * ──────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1300; // ms — max 1.5s including 200ms exit fade

    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setBarWidth(pct);

      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        // Brief pause then trigger exit fade
        setTimeout(() => setVisible(false), 80);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ss-loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center select-none"
          aria-label="St·Surfers loading"
          aria-live="polite"
          role="status"
        >
          {/* ── Car arc SVG drawing in ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <svg
              width="120"
              height="88"
              viewBox="0 0 300 220"
              fill="none"
              aria-hidden="true"
            >
              {/* Car body outline — strokes animate in */}
              <motion.path
                d="M30 145 L44 108 Q65 70 122 60 Q150 55 178 60 Q235 70 256 108 L270 145 L270 165 Q270 176 260 176 L40 176 Q30 176 30 165 Z"
                stroke="#D01C00"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
              />
              {/* Left wheel */}
              <motion.circle
                cx="88"
                cy="176"
                r="24"
                stroke="#D01C00"
                strokeWidth="5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.42, delay: 0.72, ease: "easeInOut" }}
              />
              {/* Right wheel */}
              <motion.circle
                cx="212"
                cy="176"
                r="24"
                stroke="#D01C00"
                strokeWidth="5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.42, delay: 0.72, ease: "easeInOut" }}
              />
              {/* Route dashed line */}
              <motion.line
                x1="90"
                y1="206"
                x2="210"
                y2="206"
                stroke="rgba(208,28,0,0.45)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="10 7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.25 }}
              />
            </svg>
          </motion.div>

          {/* ── Logo wordmark ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-col items-center"
          >
            <span
              className="font-display font-extrabold text-white text-2xl"
              style={{ letterSpacing: "-0.01em" }}
            >
              St·Surfers
            </span>
            <span
              className="font-body uppercase tracking-widest mt-0.5"
              style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: "#D01C00" }}
            >
              South-Side Shuttles
            </span>
          </motion.div>

          {/* ── Red progress bar (bottom edge) ── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: "#111" }}
            aria-hidden="true"
          >
            <div
              className="h-full"
              style={{
                width: `${barWidth}%`,
                background: "#D01C00",
                transition: "none",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
