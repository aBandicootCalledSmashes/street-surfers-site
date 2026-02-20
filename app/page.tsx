"use client";

/**
 * ST·SURFERS — HOME PAGE
 * ─────────────────────────────────────────────────────────────────────
 * Section order (from brand KB §8):
 *  [1] Hero           — #hero
 *  [2] Ride/Book      — #ride       ✅ Built
 *  [3] Earn/Drive     — #drive      ✅ Built
 *  [4] How It Works   — #how-it-works ✅ Built
 *  [5] Safety         — #safety     ✅ Built
 *  [6] Benefits       — #benefits   ✅ Built
 *  [7] About          — #about      ✅ Built
 *  [8] Coverage       — #coverage   ✅ Built
 *  [9] Footer                       ✅ Built
 *
 * Polish layer (Session 11):
 *  - LoadingScreen  — SVG draw-in + progress bar, max 1.5s, z-[200]
 *  - CustomCursor   — dot + lagged ring, desktop only
 *  - ScrollReveal   — wraps sections 2–9 for entrance animations
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Navbar             from "@/components/Navbar";
import HeroSection        from "@/components/HeroSection";
import RideSection        from "@/components/RideSection";
import DriveSection       from "@/components/DriveSection";
import HowItWorksSection  from "@/components/HowItWorksSection";
import SafetySection      from "@/components/SafetySection";
import BenefitsSection    from "@/components/BenefitsSection";
import WaitlistModal      from "@/components/WaitlistModal";
import Footer             from "@/components/Footer";
import ErrorBoundary      from "@/components/ErrorBoundary";
import AboutSection       from "@/components/AboutSection";
import CoverageSection    from "@/components/CoverageSection";
import LoadingScreen      from "@/components/LoadingScreen";
import CustomCursor       from "@/components/CustomCursor";
import ScrollReveal       from "@/components/ScrollReveal";

export default function Home() {
  // Waitlist modal state — lifted here so Navbar CTA and section CTAs share it
  const [waitlistOpen,   setWaitlistOpen]   = useState(false);
  // Optional budget pre-fill from idle trick slider
  const [waitlistBudget, setWaitlistBudget] = useState<number | undefined>();
  // Source tracking — which CTA triggered the modal
  const [waitlistSource, setWaitlistSource] = useState<string | undefined>();

  function handleWaitlistClick(budget?: number, source?: string) {
    setWaitlistBudget(budget);
    setWaitlistSource(source);
    setWaitlistOpen(true);
  }

  return (
    <>
      {/* ── LOADING SCREEN — black overlay, fades out after ~1.5s ──── */}
      <LoadingScreen />

      {/* ── CUSTOM CURSOR — desktop only, touch devices get nothing ── */}
      <CustomCursor />

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <Navbar onWaitlistClick={() => handleWaitlistClick(undefined, "navbar")} />

      <main>

        {/* ── [1] HERO — no ScrollReveal (fires immediately on load) ── */}
        {/*
          Background video: Pexels #2675508 — "Aerial Footage of Road System at Night"
          Download from: https://www.pexels.com/video/aerial-footage-of-the-road-system-in-a-city-at-night-2675508/
          Save as: site/public/assets/video/hero-bg.mp4
        */}
        <ErrorBoundary label="Hero">
          <HeroSection
            onWaitlistClick={() => handleWaitlistClick(undefined, "hero")}
            videoSrc="/assets/video/hero-bg.mp4"
          />
        </ErrorBoundary>

        {/* ── [2] RIDE / BOOK ──────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="Price Estimator">
            <RideSection onWaitlistClick={handleWaitlistClick} />
            {/* RideSection passes source="estimator-cta" or "budget-slider" */}
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [3] EARN / DRIVE ─────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="Drive Section">
            <DriveSection />
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [4] HOW IT WORKS ─────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="How It Works">
            <HowItWorksSection />
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [5] SAFETY ───────────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="Safety">
            <SafetySection />
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [6] BENEFITS ─────────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="Benefits">
            <BenefitsSection />
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [7] ABOUT ────────────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="About">
            <AboutSection />
          </ErrorBoundary>
        </ScrollReveal>

        {/* ── [8] COVERAGE ─────────────────────────────────────────── */}
        <ScrollReveal>
          <ErrorBoundary label="Coverage">
            <CoverageSection />
          </ErrorBoundary>
        </ScrollReveal>

      </main>

      {/* ── [9] FOOTER ───────────────────────────────────────────────── */}
      <ScrollReveal>
        <ErrorBoundary label="Footer">
          <Footer onWaitlistClick={() => handleWaitlistClick(undefined, "footer")} />
        </ErrorBoundary>
      </ScrollReveal>

      {/* ── WAITLIST MODAL ────────────────────────────────────────────── */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        defaultBudget={waitlistBudget}
        source={waitlistSource}
      />
    </>
  );
}
