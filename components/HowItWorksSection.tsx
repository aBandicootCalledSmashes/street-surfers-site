"use client";

import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Step data ─────────────────────────────────────────────────────────────────

const RIDER_STEPS = [
  {
    number: "01",
    emoji: "🗓️",
    title: "Pick your schedule",
    body: "Choose your days, times, and zones. Morning, afternoon, return — we plan around your life.",
  },
  {
    number: "02",
    emoji: "📍",
    title: "Set your route",
    body: "Pickup at your door. Drop-off where you need to be. We come to you.",
  },
  {
    number: "03",
    emoji: "✅",
    title: "Get your driver",
    body: "We match you to a verified, background-checked driver on your route. Your seat is booked.",
  },
  {
    number: "04",
    emoji: "🚗",
    title: "Ride. Every day.",
    body: "Same driver, same time, same price. No app juggling. Just show up — we handle the rest.",
  },
];

const DRIVER_STEPS = [
  {
    number: "01",
    emoji: "📝",
    title: "Apply online",
    body: "Fill out the form below. Takes about 10 minutes. Honest.",
  },
  {
    number: "02",
    emoji: "🔍",
    title: "Get verified",
    body: "Background check, licence confirmation, vehicle inspection. We keep it thorough.",
  },
  {
    number: "03",
    emoji: "🗺️",
    title: "Choose your zones",
    body: "Pick the routes, times, and areas that work for you. You set the availability.",
  },
  {
    number: "04",
    emoji: "💰",
    title: "Earn every month",
    body: "Fixed contracts mean fixed income. Know what you&apos;re earning before the month starts.",
  },
];

// ── Horizontal card (desktop) ─────────────────────────────────────────────────

function HorizontalStepCard({
  step,
  index,
  inView,
}: {
  step: typeof RIDER_STEPS[number];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-1 flex flex-col items-center text-center px-3"
    >
      {/* Step number circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold text-white text-base flex-shrink-0 mb-5"
        style={{ background: "#D01C00" }}
      >
        {step.number}
      </div>

      {/* Card body */}
      <div
        className="w-full rounded-2xl p-5 flex flex-col items-center flex-1"
        style={{
          background: "#0D0D0D",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span className="text-2xl mb-3 block" aria-hidden="true">{step.emoji}</span>
        <h3 className="font-display font-bold text-white text-base mb-2 leading-snug">
          {step.title}
        </h3>
        <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

// ── Vertical card (mobile) ────────────────────────────────────────────────────

function VerticalStepCard({
  step,
  index,
  isLast,
}: {
  step: typeof RIDER_STEPS[number];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="flex gap-4"
    >
      {/* Left spine: circle + dashed line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white text-sm"
          style={{ background: "#D01C00" }}
        >
          {step.number}
        </div>
        {!isLast && (
          <div
            className="flex-1 mt-2"
            style={{
              width: "2px",
              borderLeft: "2px dashed rgba(208,28,0,0.4)",
              minHeight: "2.5rem",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#0D0D0D",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-xl mb-2 block" aria-hidden="true">{step.emoji}</span>
          <h3 className="font-display font-bold text-white text-base mb-1">{step.title}</h3>
          <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {step.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"rider" | "driver">("rider");
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true });
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  const steps = activeTab === "rider" ? RIDER_STEPS : DRIVER_STEPS;

  return (
    <section
      id="how-it-works"
      className="relative section-py"
      style={{
        background: "#000000",
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 39px, rgba(255,255,255,0.025) 39px, rgba(255,255,255,0.025) 40px)",
      }}
      aria-labelledby="how-heading"
    >
      <div className="container-site">

        {/* Header */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2
            id="how-heading"
            className="font-display font-extrabold text-ss-white text-4xl md:text-5xl mb-4 leading-tight"
          >
            Simple. Scheduled. Sorted.
          </h2>
          <p className="text-ss-white-muted font-body text-lg max-w-xl">
            Your ride is booked — not guessed at. Not hoped for.
          </p>
        </motion.div>

        {/* Tab toggle — underline style */}
        <div
          className="inline-flex mb-10 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
          role="tablist"
          aria-label="How it works tabs"
        >
          {(["rider", "driver"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-6 py-3 text-sm font-body font-semibold transition-colors"
              style={{ color: activeTab === tab ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}
            >
              {tab === "rider" ? "For Riders" : "For Drivers"}
              {/* Active underline */}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "#D01C00" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Steps — AnimatePresence for tab switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* DESKTOP — horizontal timeline */}
            <div ref={stepsRef} className="hidden lg:flex items-start">
              {steps.map((step, i) => (
                <React.Fragment key={step.number}>
                  <HorizontalStepCard step={step} index={i} inView={stepsInView} />
                  {/* Dashed connector between cards — aligned to circle centre (pt-6 = 24px = half of h-12) */}
                  {i < steps.length - 1 && (
                    <div className="flex items-start pt-6 w-8 flex-shrink-0" aria-hidden="true">
                      <div
                        className="w-full"
                        style={{ borderTop: "2px dashed rgba(208,28,0,0.45)" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* MOBILE — vertical list */}
            <div className="flex flex-col lg:hidden max-w-lg">
              {steps.map((step, i) => (
                <VerticalStepCard
                  key={step.number}
                  step={step}
                  index={i}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
