"use client";

/**
 * ST·SURFERS — SCROLL REVEAL WRAPPER
 * ──────────────────────────────────────────────────────────────────
 * Wraps any block with an IntersectionObserver-driven entrance
 * animation: translateY(40px)→0 + opacity 0→1, fires once.
 *
 * Mobile: uses 20px translate (less dramatic, faster perceived load)
 * prefers-reduced-motion: renders children with no animation.
 *
 * Usage:
 *   <ScrollReveal delay={0.1}>
 *     <MySection />
 *   </ScrollReveal>
 * ──────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Optional stagger delay in seconds */
  delay?: number;
  /** Pass-through className for layout control */
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  className,
}: ScrollRevealProps) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once: true, margin: "-60px 0px" });
  const shouldReduce = useReducedMotion();

  // Determine y-offset: 20px on small screens, 40px on desktop.
  // useState lazy initialiser runs once on mount (client only).
  const [yOffset] = useState<number>(() => {
    if (typeof window === "undefined") return 40;
    return window.innerWidth < 768 ? 20 : 40;
  });

  // Respect prefers-reduced-motion — no transforms, no fade
  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1], // custom ease-out with slight overshoot
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
