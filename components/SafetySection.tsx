"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ── 3 Safety pillars ──────────────────────────────────────────────────────────

const SAFETY_PILLARS = [
  {
    emoji: "🔍",
    title: "Verified Drivers",
    body: "Every driver undergoes a full criminal background check, license verification, and vehicle inspection before their first trip.",
    live: true,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    emoji: "🛡️",
    title: "Scholar-Safe Routes",
    body: "Scholar transport follows dedicated safety protocols. Drivers trained in child safety standards.",
    live: true,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    emoji: "📍",
    title: "Live Tracking",
    body: "GPS tracking for every trip. Parents and staff always know exactly where the vehicle is.",
    live: false, // coming with app launch
    badge: "Coming with app launch",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

// ── Pillar card ───────────────────────────────────────────────────────────────

function PillarCard({
  pillar,
  index,
}: {
  pillar: typeof SAFETY_PILLARS[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col gap-5 rounded-2xl p-8"
      style={{
        background: pillar.live ? "#0D0D0D" : "rgba(13,13,13,0.7)",
        border: pillar.live
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Icon block */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: pillar.live ? "rgba(208,28,0,0.12)" : "rgba(255,255,255,0.04)",
            color: pillar.live ? "#D01C00" : "rgba(255,255,255,0.25)",
          }}
        >
          {pillar.icon}
        </div>

        {/* Coming soon badge */}
        {!pillar.live && pillar.badge && (
          <span
            className="text-xs font-body font-semibold px-3 py-1 rounded-full flex-shrink-0 mt-1"
            style={{
              background: "rgba(208,28,0,0.08)",
              color: "rgba(208,28,0,0.6)",
              border: "1px solid rgba(208,28,0,0.2)",
            }}
          >
            {pillar.badge}
          </span>
        )}
      </div>

      {/* Text */}
      <div>
        <h3
          className="font-display font-bold text-xl mb-3 leading-snug"
          style={{ color: pillar.live ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}
        >
          {pillar.title}
        </h3>
        <p
          className="font-body text-base leading-relaxed"
          style={{ color: pillar.live ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}
        >
          {pillar.body}
        </p>
      </div>

      {/* Live indicator dot */}
      {pillar.live && (
        <div className="flex items-center gap-2 mt-auto pt-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#D01C00" }}
            aria-hidden="true"
          />
          <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Active now
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function SafetySection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true });
  const pillRef = useRef<HTMLDivElement>(null);
  const pillInView = useInView(pillRef, { once: true, margin: "-40px" });

  return (
    <section
      id="safety"
      className="relative section-py"
      style={{ background: "#000000" }}
      aria-labelledby="safety-heading"
    >
      {/* Red vignette — radial gradient, very subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(208,28,0,0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative">

        {/* Header */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            Your safety, our standard
          </p>
          <h2
            id="safety-heading"
            className="font-display font-extrabold text-ss-white text-4xl md:text-5xl mb-4 leading-tight"
          >
            Safety isn&apos;t a feature.<br className="hidden sm:block" /> It&apos;s our foundation.
          </h2>
          <p className="text-ss-white-muted font-body text-lg max-w-xl">
            Before a single passenger climbs in, we&apos;ve already done the work.
          </p>
        </motion.div>

        {/* 3-pillar grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {SAFETY_PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i} />
          ))}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          ref={pillRef}
          initial={{ opacity: 0, y: 16 }}
          animate={pillInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl"
          style={{
            background: "rgba(208,28,0,0.06)",
            border: "1px solid rgba(208,28,0,0.2)",
          }}
        >
          {/* Shield icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(208,28,0,0.15)", color: "#D01C00" }}
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <div>
            <p className="font-display font-bold text-ss-white text-base mb-0.5">
              Scholar safety comes first
            </p>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Every child on our shuttles travels with a verified driver, a roadworthy vehicle,
              and a seatbelt. Parents can track progress once our app launches.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
