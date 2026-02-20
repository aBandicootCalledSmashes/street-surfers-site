"use client";

/**
 * ST·SURFERS — WAITLIST MODAL (v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggers: Navbar "Join Waitlist" | Price estimator CTA | Budget slider CTA | Hero
 *
 * BACKEND: Google Apps Script → same sheet as driver form, routed by sheetName field.
 * Endpoint URL below — same deployment as DriverApplicationForm.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const WAITLIST_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbykAd2MvxAD1DPCT3nXahrvrtmy7A1o4UCCoQ-EpLeygJ1zXTfY9vfbsUpYqJa3zVE/exec";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { COVERAGE_AREAS, REFERRAL_SOURCES, CONTACT, BRAND } from "@/lib/constants";

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  name:     z.string().min(2, "Full name is required"),
  email:    z.string().email("Valid email address required"),
  phone:    z.string().optional(),
  riderType: z.enum(["staff", "scholar", "parent", "employer"], {
    error: "Please select one",
  }),
  area:     z.string().optional(),
  referral: z.string().optional(),
  notifyLaunch:        z.boolean(),
  interestedInDriving: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const RIDER_TYPES = [
  { value: "staff",    label: "Staff Member" },
  { value: "scholar",  label: "Scholar" },
  { value: "parent",   label: "Parent / Guardian" },
  { value: "employer", label: "Employer / Company" },
] as const;

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-body text-ss-white-muted uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-body text-ss-red">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-ss-surface border border-ss-white-faint rounded-xl px-4 py-3 text-sm font-body text-ss-white placeholder:text-ss-white-muted focus:outline-none focus:border-ss-red transition-colors";

// ─── Animated checkmark SVG ───────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      className="mx-auto"
    >
      <motion.circle
        cx="32" cy="32" r="28"
        stroke="#D01C00"
        strokeWidth="2.5"
        fill="rgba(208,28,0,0.1)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M20 32l9 9 15-16"
        stroke="#D01C00"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  isOpen:         boolean;
  onClose:        () => void;
  defaultBudget?: number;
  source?:        string;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function WaitlistModal({
  isOpen,
  onClose,
  defaultBudget,
  source,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [countdown, setCountdown]     = useState(8);
  const [copied, setCopied]           = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const firstNameRef = useRef("");

  // Detect mobile for bottom-sheet behaviour
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      riderType:           "staff",
      notifyLaunch:        true,
      interestedInDriving: false,
    },
  });

  // ESC close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && submitState !== "success") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, submitState]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSubmitState("idle");
      setCountdown(8);
      setCopied(false);
    }
  }, [isOpen, reset]);

  // Auto-close countdown on success
  useEffect(() => {
    if (submitState !== "success") return;
    setCountdown(8);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    const timeout = setTimeout(onClose, 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [submitState, onClose]);

  async function onSubmit(data: FormData) {
    setSubmitState("loading");
    const firstName = data.name.trim().split(" ")[0];
    firstNameRef.current = firstName;
    try {
      await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        mode:   "no-cors",
        body:   JSON.stringify({
          ...data,
          sheetName: "Waitlist",
          budget:    defaultBudget ?? null,
          source:    source ?? null,
          timestamp: new Date().toISOString(),
        }),
      });
      // Persist first name for the thank-you page
      try { localStorage.setItem("ss_waitlist_name", firstName); } catch { /* storage may be blocked */ }
      // Redirect to dedicated confirmation page
      window.location.href = `/thank-you.html?name=${encodeURIComponent(firstName)}`;
    } catch {
      setSubmitState("error");
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const selectedRiderType = watch("riderType");

  const whatsappText = encodeURIComponent(
    `Just joined the St·Surfers waitlist 🏄 — safe, scheduled transport for Joburg. You should join too: ${BRAND.website}`
  );

  // ── Animation props (desktop: scale spring | mobile: slide up) ──────────────
  const cardInitial  = isMobile ? { y: "100%", opacity: 0 } : { scale: 0.92, opacity: 0 };
  const cardAnimate  = isMobile ? { y: 0,      opacity: 1 } : { scale: 1,    opacity: 1 };
  const cardExit     = isMobile ? { y: "100%", opacity: 0 } : { scale: 0.94, opacity: 0 };
  const cardSpring   = isMobile
    ? { type: "spring" as const, stiffness: 300, damping: 32 }
    : { type: "spring" as const, stiffness: 280, damping: 20 };

  // ── Card position classes
  const cardPositionCls = isMobile
    ? "fixed bottom-0 left-0 right-0 rounded-t-[16px] rounded-b-none max-h-[92vh] overflow-y-auto"
    : "w-full max-w-[480px] rounded-[8px] max-h-[90vh] overflow-y-auto relative";

  // ── Card style
  const cardStyle = {
    background:  "#0D0D0D",
    border:      "1px solid rgba(208,28,0,0.3)",
    boxShadow:   "0 0 60px rgba(208,28,0,0.15)",
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={(e) => {
              if (e.target === overlayRef.current && submitState !== "success") onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
          >
            <motion.div
              initial={cardInitial}
              animate={cardAnimate}
              exit={cardExit}
              transition={cardSpring}
              className={cardPositionCls}
              style={cardStyle}
            >
              {/* Mobile drag handle */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-ss-white-faint" />
                </div>
              )}

              {/* Close button — hidden during success */}
              {submitState !== "success" && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-ss-white-muted hover:text-ss-white hover:bg-ss-surface transition-colors z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">

                  {/* ── SUCCESS STATE ──────────────────────────────────────── */}
                  {submitState === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-4"
                    >
                      <div className="mb-5">
                        <AnimatedCheck />
                      </div>
                      <h3 className="font-display font-extrabold text-ss-white text-2xl mb-3">
                        You&apos;re on the list! 🏄
                      </h3>
                      <p className="text-ss-white-muted font-body text-base mb-6">
                        We&apos;ll see you on the road,{" "}
                        <strong className="text-ss-white">{firstNameRef.current}</strong>.{" "}
                        Joburg, sorted.
                      </p>

                      {/* Share row */}
                      <p className="text-xs font-body text-ss-white-muted uppercase tracking-widest mb-3">
                        Share with a friend:
                      </p>
                      <div className="flex gap-3 justify-center mb-6">
                        <a
                          href={`https://wa.me/?text=${whatsappText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-semibold text-white"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          WhatsApp
                        </a>
                        <button
                          onClick={handleCopyLink}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-semibold transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: copied ? "#D01C00" : "rgba(255,255,255,0.8)",
                          }}
                        >
                          {copied ? (
                            <>✓ Copied!</>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy link
                            </>
                          )}
                        </button>
                      </div>

                      {/* Auto-close countdown */}
                      <p className="text-ss-white-muted font-body text-xs mb-4 opacity-50">
                        Closing in {countdown}s
                      </p>
                      <button
                        onClick={onClose}
                        className="text-ss-white-muted font-body text-sm hover:text-ss-white transition-colors"
                      >
                        Done
                      </button>
                    </motion.div>

                  ) : submitState === "error" ? (

                    /* ── ERROR STATE ────────────────────────────────────────── */
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-6"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: "rgba(208,28,0,0.1)", border: "1px solid rgba(208,28,0,0.3)" }}
                      >
                        <svg className="w-6 h-6 text-ss-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                      </div>
                      <p className="text-ss-white font-body text-base mb-2">
                        That didn&apos;t go through.
                      </p>
                      <p className="text-ss-white-muted font-body text-sm mb-6">
                        Give it another try, or drop us a WhatsApp at{" "}

                        <a
                          href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ss-red hover:text-white transition-colors"
                        >
                          {CONTACT.whatsapp}
                        </a>
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setSubmitState("idle")}
                          className="px-5 py-2.5 rounded-xl font-body text-sm font-semibold text-white"
                          style={{ backgroundColor: "#D01C00" }}
                        >
                          Try again
                        </button>
                        <button
                          onClick={onClose}
                          className="px-5 py-2.5 rounded-xl font-body text-sm font-semibold text-ss-white-muted hover:text-ss-white transition-colors"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>

                  ) : (

                    /* ── FORM STATE ─────────────────────────────────────────── */
                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-6">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-display font-extrabold text-ss-white leading-none" style={{ fontSize: "20px", letterSpacing: "-0.02em" }}>St·Surfers</span>
                            <span className="font-body text-ss-red uppercase tracking-widest" style={{ fontSize: "9px" }}>South-Side Shuttles</span>
                          </div>
                        </div>
                        <h2
                          id="waitlist-title"
                          className="font-display font-extrabold text-ss-white mb-3"
                          style={{ fontSize: "28px" }}
                        >
                          Claim your spot. 🏄
                        </h2>
                        <p className="font-body text-ss-white-muted" style={{ fontSize: "15px" }}>
                          {defaultBudget
                            ? `We'll find you a St·Surfers plan around R${defaultBudget.toLocaleString("en-ZA")}/month. Join the list and we'll be in touch.`
                            : "We launch soon. Founding members lock in the lowest rates — first in, best seated."}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Full name *" error={errors.name?.message}>
                            <input
                              {...register("name")}
                              type="text"
                              placeholder="Your full name"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Email address *" error={errors.email?.message}>
                            <input
                              {...register("email")}
                              type="email"
                              placeholder="your@email.com"
                              className={inputCls}
                            />
                          </Field>
                        </div>

                        {/* Phone */}
                        <Field label="Phone number (optional)" error={errors.phone?.message}>
                          <input
                            {...register("phone")}
                            type="tel"
                            placeholder="+27 69 XXX XXXX"
                            className={inputCls}
                          />
                        </Field>

                        {/* Rider type pills */}
                        <Field label="I am a *" error={errors.riderType?.message}>
                          <div className="flex flex-wrap gap-2">
                            {RIDER_TYPES.map((t) => (
                              <label key={t.value} className="cursor-pointer">
                                <input {...register("riderType")} type="radio" value={t.value} className="sr-only" />
                                <span
                                  className={`inline-block px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all border ${
                                    selectedRiderType === t.value
                                      ? "text-white border-ss-red"
                                      : "bg-ss-surface text-ss-white-muted border-ss-white-faint hover:text-ss-white"
                                  }`}
                                  style={selectedRiderType === t.value ? { backgroundColor: "#D01C00" } : {}}
                                >
                                  {t.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </Field>

                        {/* Area + Referral */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Your area in JHB" error={errors.area?.message}>
                            <div className="relative">
                              <select
                                {...register("area")}
                                defaultValue=""
                                className={`${inputCls} appearance-none cursor-pointer`}
                              >
                                <option value="">Select area…</option>
                                {COVERAGE_AREAS.map((a) => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </select>
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ss-white-muted">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                          </Field>
                          <Field label="How did you hear about us?" error={errors.referral?.message}>
                            <div className="relative">
                              <select
                                {...register("referral")}
                                defaultValue=""
                                className={`${inputCls} appearance-none cursor-pointer`}
                              >
                                <option value="">Select…</option>
                                {REFERRAL_SOURCES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ss-white-muted">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </div>
                          </Field>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3 pt-1">
                          {[
                            { name: "notifyLaunch" as const,        label: "Notify me when the app launches" },
                            { name: "interestedInDriving" as const,  label: "I'm also interested in becoming a driver partner" },
                          ].map(({ name, label }) => (
                            <label key={name} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                {...register(name)}
                                type="checkbox"
                                className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                                style={{ accentColor: "#D01C00" }}
                              />
                              <span className="text-ss-white-muted text-sm font-body group-hover:text-ss-white transition-colors">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>

                        {/* POPIA notice */}
                        <p className="text-xs font-body opacity-40 text-ss-white-muted pt-1">
                          Your info is handled in accordance with POPIA. We don&apos;t sell data, full stop.
                        </p>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={submitState === "loading"}
                          className="wl-btn-shine w-full py-4 rounded-xl font-display font-bold uppercase tracking-widest text-white text-sm flex items-center justify-center gap-3 active:scale-[0.97] transition-transform disabled:opacity-60"
                          style={{ backgroundColor: "#D01C00" }}
                        >
                          {submitState === "loading" ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Just a sec…
                            </>
                          ) : (
                            "Secure My Spot →"
                          )}
                        </button>

                        {/* WhatsApp alternative */}
                        <p className="text-center text-ss-white-muted text-xs font-body">
                          Prefer WhatsApp?{" "}
                          <a
                            href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ss-red hover:text-white transition-colors"
                          >
                            Message us directly
                          </a>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
