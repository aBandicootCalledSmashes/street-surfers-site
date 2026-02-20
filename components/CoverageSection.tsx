"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CONTACT, COVERAGE_PRIMARY, COVERAGE_EXPANDING } from "@/lib/constants";

// Same Apps Script deployment that handles Waitlist + Drivers — routes by sheetName
const COVERAGE_INTEREST_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbykAd2MvxAD1DPCT3nXahrvrtmy7A1o4UCCoQ-EpLeygJ1zXTfY9vfbsUpYqJa3zVE/exec";

// ─── Animation variants ────────────────────────────────────────────────────────

const pillVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.38, ease: "backOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoverageSection() {
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      await fetch(COVERAGE_INTEREST_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          area: area || "Not specified",
          type: "coverage_interest",
          sheetName: "Coverage",
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="coverage"
      className="relative bg-ss-black section-py overflow-hidden"
      aria-labelledby="coverage-heading"
    >
      {/* Subtle map texture */}
      <div
        className="bg-map-texture absolute inset-0 pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      />

      {/* Red radial glow — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-[480px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(208,28,0,0.07) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <span className="accent-line mb-6 block" aria-hidden="true" />
          <p className="font-body text-sm text-ss-red uppercase tracking-widest mb-3">
            Where we operate
          </p>
          <h2
            id="coverage-heading"
            className="font-display font-bold text-ss-white mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.1 }}
          >
            Joburg is our home.
          </h2>
          <p className="font-body text-ss-white-muted text-lg max-w-lg">
            Currently serving the South Side. Expanding fast.
          </p>
        </motion.div>

        {/* ── Active areas ─────────────────────────────────────────────── */}
        <motion.p
          className="font-body text-xs uppercase tracking-widest mb-4"
          style={{ color: "rgba(255,255,255,0.35)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          Active now
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {COVERAGE_PRIMARY.map((a) => (
            <motion.span
              key={a}
              variants={pillVariants}
              className="font-body text-sm font-semibold px-4 py-2 rounded-full select-none"
              style={{ background: "#D01C00", color: "#ffffff" }}
            >
              {a}
            </motion.span>
          ))}
        </motion.div>

        {/* ── Expanding areas ──────────────────────────────────────────── */}
        <motion.p
          className="font-body text-xs uppercase tracking-widest mb-4"
          style={{ color: "rgba(255,255,255,0.35)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Expanding to
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap gap-2 mb-14"
        >
          {COVERAGE_EXPANDING.map((a) => (
            <motion.span
              key={a}
              variants={pillVariants}
              className="inline-flex items-center gap-2 font-body text-sm px-4 py-2 rounded-full select-none"
              style={{
                background: "#0D0D0D",
                border: "1px dashed rgba(208,28,0,0.4)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {a}
              <span
                className="font-body font-semibold rounded-full px-1.5 py-0.5"
                style={{
                  background: "rgba(208,28,0,0.13)",
                  color: "#D01C00",
                  fontSize: "0.62rem",
                  letterSpacing: "0.05em",
                }}
              >
                Soon
              </span>
            </motion.span>
          ))}
        </motion.div>

        {/* ── Expansion interest form ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "#0D0D0D",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-center py-4"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(208,28,0,0.1)",
                  border: "1px solid rgba(208,28,0,0.3)",
                }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: "#D01C00" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="font-display font-bold text-ss-white text-xl mb-2">
                You&apos;re on the radar. 🎯
              </p>
              <p className="font-body text-ss-white-muted text-sm">
                The moment we launch in your area, you&apos;ll hear from us first.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <p className="font-display font-bold text-ss-white text-xl mb-1">
                  Not in your area yet?
                </p>
                <p className="font-body text-ss-white-muted text-sm">
                  Drop your email. When we roll into your zone, you&apos;ll be the first to know.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {/* Email input */}
                  <div className="flex-1 min-w-0">
                    <label htmlFor="cov-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="cov-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      placeholder="your@email.com"
                      className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none transition-colors"
                      style={{
                        background: "#1A1A1A",
                        border: `1px solid ${
                          emailError
                            ? "#D01C00"
                            : "rgba(255,255,255,0.1)"
                        }`,
                        color: "#fff",
                      }}
                      onFocus={(e) => {
                        if (!emailError)
                          (e.target as HTMLInputElement).style.borderColor =
                            "rgba(208,28,0,0.5)";
                      }}
                      onBlur={(e) => {
                        if (!emailError)
                          (e.target as HTMLInputElement).style.borderColor =
                            "rgba(255,255,255,0.1)";
                      }}
                    />
                    {emailError && (
                      <p
                        className="font-body text-xs mt-1.5"
                        style={{ color: "#D01C00" }}
                      >
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Area dropdown */}
                  <div className="sm:w-56 flex-shrink-0">
                    <label htmlFor="cov-area" className="sr-only">
                      Notify me when you reach
                    </label>
                    <select
                      id="cov-area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none appearance-none cursor-pointer transition-colors"
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: area ? "#fff" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      <option value="">Notify me when you reach…</option>
                      {COVERAGE_EXPANDING.map((a) => (
                        <option
                          key={a}
                          value={a}
                          style={{ color: "#fff", background: "#1A1A1A" }}
                        >
                          {a}
                        </option>
                      ))}
                      <option
                        value="Other"
                        style={{ color: "#fff", background: "#1A1A1A" }}
                      >
                        Other area
                      </option>
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-pill btn-primary flex-shrink-0 px-6 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending…
                      </span>
                    ) : (
                      "Let me know →"
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <p
                    className="font-body text-xs mt-3"
                    style={{ color: "#D01C00" }}
                  >
                    That didn&apos;t send — sorry about that. WhatsApp us at{" "}
                    <a
                      href={`https://wa.me/${CONTACT.whatsapp.replace(
                        /\D/g,
                        ""
                      )}`}
                      className="underline"
                    >
                      {CONTACT.whatsapp}
                    </a>{" "}
                    and we&apos;ll add you manually.
                  </p>
                )}
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
