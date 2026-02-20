"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RIDER_BENEFITS, TESTIMONIALS } from "@/lib/constants";

// ── Icon map — inline SVG for each benefit ────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  seat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  price: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  door: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  support: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

// Card component with individual inView trigger
function BenefitCard({
  benefit,
  index,
}: {
  benefit: typeof RIDER_BENEFITS[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-default"
      style={{
        background: "#0D0D0D",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: "3px solid #D01C00",
      }}
      whileHover={{
        boxShadow: "0 0 28px rgba(208,28,0,0.12)",
        y: -2,
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "rgba(208,28,0,0.1)", color: "#D01C00" }}
      >
        {ICONS[benefit.icon] ?? ICONS.support}
      </div>

      {/* Text */}
      <div>
        <h3 className="font-display font-bold text-ss-white text-lg mb-1 leading-snug">
          {benefit.title}
        </h3>
        <p className="text-ss-white-muted font-body text-sm leading-relaxed" style={{ maxWidth: "none" }}>
          {benefit.description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: typeof TESTIMONIALS[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: "#0D0D0D",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Quote mark */}
      <span className="font-display font-extrabold text-ss-red opacity-40 text-4xl leading-none select-none" aria-hidden="true">
        &ldquo;
      </span>
      <p className="font-body text-sm leading-relaxed text-ss-white-muted flex-1 -mt-3">
        {testimonial.quote}
      </p>
      <div className="flex items-center gap-3 border-t border-ss-white-faint pt-4">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-white text-sm"
          style={{ background: "rgba(208,28,0,0.2)", border: "1px solid rgba(208,28,0,0.3)" }}
          aria-hidden="true"
        >
          {testimonial.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-ss-white text-sm leading-tight">
            {testimonial.name}
          </p>
          <p className="font-body text-xs text-ss-white-muted truncate opacity-60 mt-0.5">
            {testimonial.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function BenefitsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true });

  return (
    <section
      id="benefits"
      className="relative bg-ss-black section-py"
      aria-labelledby="benefits-heading"
    >
      <div className="container-site">
        {/* Header */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            Rider benefits
          </p>
          <h2
            id="benefits-heading"
            className="font-display font-extrabold text-ss-white text-4xl md:text-5xl mb-4 leading-tight"
          >
            What you get as a registered rider.
          </h2>
          <p className="text-ss-white-muted font-body text-lg max-w-xl">
            More than just a ride.
          </p>
        </motion.div>

        {/* 7-card grid — 1 col / 2 col / 3-4 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {RIDER_BENEFITS.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </div>

        {/* ── Testimonials (placeholder — replace with real quotes post-launch) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            What our riders say
          </p>
          <h3 className="font-display font-bold text-ss-white text-xl md:text-2xl mb-8">
            Real people. Real commutes.
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>

        {/* Pre-launch notice */}
        <p className="text-center font-body text-xs mt-6 opacity-30 text-ss-white-muted">
          Placeholder testimonials — verified customer quotes added at launch.
        </p>
      </div>
    </section>
  );
}
