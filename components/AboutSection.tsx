"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

// ── Stat cards ─────────────────────────────────────────────────────────────────

const STATS = [
  {
    stat: "R0",
    label: "Surge pricing. Ever.",
    sub: "Your fare is your fare. No surprises.",
  },
  {
    stat: "South Side",
    label: "First. Always.",
    sub: "Joburg born. Built right here.",
  },
  {
    stat: "22",
    label: "Rides/month",
    sub: "22 guaranteed trips. Not requests — rides.",
  },
];

// ── Stat card component ────────────────────────────────────────────────────────
// Numeric stats count up from 0 when scrolled into view (rAF-driven, easeOut).

function StatCard({
  item,
  index,
}: {
  item: typeof STATS[number];
  index: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // Detect if stat is a plain integer (e.g. "22") — if so, animate count-up
  const numericValue  = parseInt(item.stat, 10);
  const isNumeric     = !isNaN(numericValue) && String(numericValue) === item.stat;
  const hasAnimated   = useRef(false);
  const [display, setDisplay] = useState(isNumeric ? "0" : item.stat);

  useEffect(() => {
    if (!inView || !isNumeric || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1200; // ms
    const start    = performance.now();

    function tick(now: number) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out: decelerates as it approaches target
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * numericValue)));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, isNumeric, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-6 flex flex-col gap-1"
      data-cursor="card"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p
        className="font-display font-extrabold leading-none tabular-nums"
        style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "#D01C00" }}
      >
        {display}
      </p>
      <p className="font-display font-bold text-white text-base">{item.label}</p>
      <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{item.sub}</p>
    </motion.div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

export default function AboutSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyInView = useInView(bodyRef, { once: true, margin: "-60px" });

  return (
    <section
      id="about"
      className="relative section-py overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* ── Background layers ── */}

      {/* Base: near-black */}
      <div className="absolute inset-0" style={{ background: "#0A0A0A" }} aria-hidden="true" />

      {/* Street map texture */}
      <div className="absolute inset-0 bg-map-texture opacity-30" aria-hidden="true" />

      {/* Red gradient atmosphere — bottom-right corner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 90% 100%, rgba(208,28,0,0.12) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Top fade to merge with previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #000000, transparent)" }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="container-site relative">

        {/* Heading block */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 max-w-3xl"
        >
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            Our story
          </p>
          <h2
            id="about-heading"
            className="font-display font-extrabold text-ss-white leading-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Built in Joburg.<br />
            Made for the daily grind.
          </h2>
        </motion.div>

        {/* Two-column layout: copy + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: body copy */}
          <motion.div
            ref={bodyRef}
            initial={{ opacity: 0, x: -24 }}
            animate={bodyInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="font-body text-lg leading-relaxed space-y-4" style={{ color: "rgba(255,255,255,0.75)" }}>
              <p>
                St·Surfers started because the South Side deserved better.
              </p>
              <p>
                Uber costs too much. Public transport is too unreliable. Every day, thousands of
                Joburgers are stuck in the middle — paying too much or waiting too long.
              </p>
              <p>
                We built something different. Scheduled transport with a seat that&apos;s yours.
                A price that doesn&apos;t change. A driver who knows your route.
              </p>
              <p>
                For the parent sending their scholar to school alone. For the worker who needs to be
                on time, every time. For the driver who wants real income, not random trips.
              </p>
              <p className="font-semibold" style={{ color: "#FFFFFF" }}>
                South Side built. Joburg proud. Let&apos;s ride.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="#ride"
                className="btn-pill btn-primary px-6 py-3 text-sm text-center"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("ride")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Book your ride →
              </a>
              <a
                href="#drive"
                className="btn-pill btn-ghost px-6 py-3 text-sm text-center"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("drive")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Drive with us →
              </a>
            </div>
          </motion.div>

          {/* Right: stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
            {STATS.map((item, i) => (
              <StatCard key={item.stat + item.label} item={item} index={i} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
