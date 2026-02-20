"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import DriverApplicationForm from "./DriverApplicationForm";

// ─── Value proposition cards ───────────────────────────────────────────────────

const VALUE_CARDS = [
  {
    emoji: "🗓️",
    title: "Your schedule, your routes",
    body: "Choose your days and zones. Morning runs, afternoon shifts — you decide what works.",
  },
  {
    emoji: "💰",
    title: "Consistent, predictable income",
    body: "Fixed staff and scholar contracts. No random trips. No surge chasing. You know what you're earning.",
  },
  {
    emoji: "🛡️",
    title: "You're not alone",
    body: "Onboarding, training, and a dedicated support team from day one. We're in your corner.",
  },
];

// ─── How it works steps ────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    icon: "📝",
    title: "Apply below",
    body: "Takes about 10 minutes. Seriously — we kept it short.",
  },
  {
    icon: "🔍",
    title: "We verify you",
    body: "Background check, licence confirmation, and a quick vehicle inspection.",
  },
  {
    icon: "💰",
    title: "Start earning",
    body: "Get assigned to your routes. Fixed schedule, fixed income. Month in, month out.",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ValueCard({ card, index }: { card: typeof VALUE_CARDS[number]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-2xl p-6"
      style={{
        background: "#0D0D0D",
        borderLeft: "3px solid #D01C00",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeftWidth: "3px",
        borderLeftColor: "#D01C00",
      }}
    >
      <span className="text-2xl mb-3 block">{card.emoji}</span>
      <h3 className="font-display font-bold text-ss-white text-base mb-2">{card.title}</h3>
      <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        {card.body}
      </p>
    </motion.div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────────

export default function DriveSection() {
  const headingRef    = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true });
  const stepsRef      = useRef<HTMLDivElement>(null);
  const stepsInView   = useInView(stepsRef, { once: true, margin: "-40px" });
  const formRef       = useRef<HTMLDivElement>(null);
  const formInView    = useInView(formRef, { once: true, margin: "-60px" });

  return (
    <section
      id="drive"
      className="relative section-py overflow-hidden"
      aria-labelledby="drive-heading"
      style={{ background: "#000000" }}
    >
      {/* Red vignette bottom-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(208,28,0,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="container-site relative">

        {/* ── Header ── */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-display font-bold text-xs text-ss-red uppercase tracking-widest mb-3">
            For Driver Partners
          </p>
          <h2
            id="drive-heading"
            className="font-display font-extrabold text-ss-white text-4xl md:text-5xl mb-4 leading-tight"
          >
            Turn your wheels<br className="hidden sm:block" /> into steady income.
          </h2>
          <p className="font-body text-lg max-w-xl" style={{ color: "rgba(255,255,255,0.6)" }}>
            Join the St·Surfers driver network. Fixed routes, fixed clients, fixed pay. No more chasing every rand.
          </p>
        </motion.div>

        {/* ── Value proposition cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {VALUE_CARDS.map((card, i) => (
            <ValueCard key={card.title} card={card} index={i} />
          ))}
        </div>

        {/* ── How it works ── */}
        <div ref={stepsRef} className="mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={stepsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="font-body text-xs text-ss-red uppercase tracking-widest mb-6"
          >
            How it works
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-0 relative">
            {/* connecting line on desktop */}
            <div
              className="hidden sm:block absolute top-5 left-0 right-0 h-px"
              style={{ background: "rgba(255,255,255,0.06)", zIndex: 0 }}
              aria-hidden="true"
            />
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 relative z-10 sm:flex-1 pb-6 sm:pb-0 sm:px-4 sm:text-center"
              >
                {/* mobile connector */}
                {i < HOW_STEPS.length - 1 && (
                  <div
                    className="sm:hidden absolute left-4 top-10 w-px"
                    style={{ height: "calc(100% - 2.5rem)", background: "rgba(255,255,255,0.06)" }}
                    aria-hidden="true"
                  />
                )}
                {/* Number circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                  style={{ background: "#D01C00", color: "#fff" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="font-display font-bold text-ss-white text-sm mb-1">{s.icon} {s.title}</p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {s.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Screening disclaimer bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex gap-4 p-5 rounded-2xl mb-12"
          style={{
            background: "rgba(208,28,0,0.06)",
            border: "1px solid rgba(208,28,0,0.18)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(208,28,0,0.14)", color: "#D01C00" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Every application goes through a full background check, licence verification,
            and vehicle inspection before activation. High standards protect our riders — and your reputation.
          </p>
        </motion.div>

        {/* ── Application Form ── */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 24 }}
          animate={formInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="mb-6">
            <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-2">Ready to get started?</p>
            <h3 className="font-display font-extrabold text-ss-white text-2xl md:text-3xl">
              Apply to drive with St·Surfers
            </h3>
          </div>
          <DriverApplicationForm />
        </motion.div>

      </div>
    </section>
  );
}
