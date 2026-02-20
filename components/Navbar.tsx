"use client";

/**
 * ST·SURFERS — NAVBAR
 * ─────────────────────────────────────────────────────────────────────
 * Behavior spec (from brand KB):
 *  - Starts: transparent + backdrop-blur over hero
 *  - On scroll > 60px: solid #000 + subtle bottom border
 *  - Scrolling DOWN: hides (slides up, like Uber)
 *  - Scrolling UP:   reveals (slides back in)
 *  - Active section: detected via IntersectionObserver, red underline on nav link
 *  - Mobile: hamburger → animated lines → slide-down drawer
 *  - CTA: "Join Waitlist" red pill — opens waitlist modal (wired up separately)
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, BRAND } from "@/lib/constants";

interface NavbarProps {
  /** Called when "Join Waitlist" is clicked — parent opens the modal */
  onWaitlistClick?: () => void;
}

export default function Navbar({ onWaitlistClick }: NavbarProps) {
  const [scrolled,       setScrolled]       = useState(false);
  const [hidden,         setHidden]          = useState(false);
  const [mobileOpen,     setMobileOpen]      = useState(false);
  const [activeSection,  setActiveSection]   = useState<string>("");

  const lastScrollY  = useRef(0);
  const ticking      = useRef(false);

  // ── SCROLL HANDLER ─────────────────────────────────────────────────
  // Uses requestAnimationFrame throttle for smooth 60fps performance.

  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;

      // Solid bg threshold
      setScrolled(currentY > 60);

      // Hide/reveal on scroll direction (with 100px grace zone at top)
      if (currentY > lastScrollY.current && currentY > 100) {
        setHidden(true);
        setMobileOpen(false); // close drawer when navbar hides
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── ACTIVE SECTION DETECTION ───────────────────────────────────────
  // IntersectionObserver watches each section — whichever is most
  // visible marks the active nav link.

  useEffect(() => {
    const sectionIds = NAV_LINKS.map(l => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        {
          threshold:  0.4,
          rootMargin: `-${64}px 0px 0px 0px`, // account for navbar height
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── SMOOTH SCROLL ──────────────────────────────────────────────────

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false);
    const id  = href.replace("#", "");
    const el  = document.getElementById(id);
    if (!el) return;

    const offset = el.getBoundingClientRect().top + window.scrollY - 64; // 64 = navbar height
    window.scrollTo({ top: offset, behavior: "smooth" });
  }, []);

  // ── MOBILE BODY LOCK ───────────────────────────────────────────────
  // Prevent body scroll when mobile drawer is open.

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── RENDER ────────────────────────────────────────────────────────

  return (
    <>
      {/* ── MAIN NAVBAR ─────────────────────────────────────────────── */}
      <motion.header
        role="banner"
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={[
          "fixed top-0 left-0 right-0 z-[70]",
          "transition-[background-color,border-color] duration-300",
          scrolled
            ? "bg-ss-black border-b border-ss-white-faint"
            : "bg-transparent backdrop-blur-md",
        ].join(" ")}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between h-16"
            aria-label="Main navigation"
          >

            {/* ── LOGO ──────────────────────────────────────────────── */}
            <a
              href="/"
              className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ss-red rounded-sm flex flex-col leading-none"
              aria-label={`${BRAND.name} — Home`}
            >
              <span className="font-display font-extrabold text-white tracking-tight" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                St·Surfers
              </span>
              <span className="font-body text-ss-red uppercase tracking-widest" style={{ fontSize: "0.55rem", letterSpacing: "0.14em" }}>
                South-Side Shuttles
              </span>
            </a>

            {/* ── DESKTOP NAV LINKS ─────────────────────────────────── */}
            <div
              className="hidden md:flex items-center gap-8"
              role="list"
            >
              {NAV_LINKS.map(({ label, href }) => {
                const sectionId = href.replace("#", "");
                const isActive  = activeSection === sectionId;

                return (
                  <div key={href} role="listitem">
                    <button
                      onClick={() => scrollTo(href)}
                      className={[
                        "relative font-body text-sm font-medium",
                        "py-1 transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ss-red rounded-sm",
                        isActive
                          ? "text-ss-white"
                          : "text-ss-white-muted hover:text-ss-white",
                      ].join(" ")}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {label}

                      {/* Active indicator — animated underline */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-line"
                          className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-ss-red rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── RIGHT SIDE: CTA + HAMBURGER ───────────────────────── */}
            <div className="flex items-center gap-3">

              {/* Desktop CTA */}
              <button
                onClick={onWaitlistClick}
                className={[
                  "hidden md:inline-flex items-center",
                  "btn-pill btn-primary",
                  "px-5 py-2.5 text-sm",
                  "font-display font-bold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ss-red focus-visible:ring-offset-2 focus-visible:ring-offset-ss-black",
                ].join(" ")}
                aria-label="Join the St·Surfers waitlist"
              >
                Join Waitlist
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(prev => !prev)}
                className={[
                  "md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ss-red rounded-sm",
                ].join(" ")}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                <motion.span
                  className="block w-[22px] h-[2px] bg-white rounded-full origin-center"
                  animate={mobileOpen
                    ? { rotate: 45,  y: 7,  scaleX: 1 }
                    : { rotate: 0,   y: 0,  scaleX: 1 }
                  }
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
                <motion.span
                  className="block w-[22px] h-[2px] bg-white rounded-full"
                  animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="block w-[22px] h-[2px] bg-white rounded-full origin-center"
                  animate={mobileOpen
                    ? { rotate: -45, y: -7, scaleX: 1 }
                    : { rotate: 0,   y: 0,  scaleX: 1 }
                  }
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              </button>

            </div>
          </nav>
        </div>
      </motion.header>

      {/* ── MOBILE DRAWER ───────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-nav"
              key="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: [0.0, 0, 0.2, 1] }}
              className={[
                "fixed top-16 inset-x-0 z-[65]",
                "bg-ss-black border-b border-ss-white-faint",
                "md:hidden",
              ].join(" ")}
            >
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">

                {/* Nav links */}
                <ul className="flex flex-col" role="list">
                  {NAV_LINKS.map(({ label, href }, i) => {
                    const sectionId = href.replace("#", "");
                    const isActive  = activeSection === sectionId;

                    return (
                      <motion.li
                        key={href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.2 }}
                        role="listitem"
                      >
                        <button
                          onClick={() => scrollTo(href)}
                          className={[
                            "w-full text-left py-4 font-body text-lg font-medium",
                            "border-b border-ss-white-faint last:border-0",
                            "transition-colors duration-150",
                            "flex items-center justify-between",
                            isActive
                              ? "text-ss-white"
                              : "text-ss-white-muted hover:text-ss-white",
                          ].join(" ")}
                        >
                          {label}
                          {/* Active indicator */}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-ss-red flex-shrink-0" />
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.06 + 0.05, duration: 0.2 }}
                  className="pt-4 pb-2"
                >
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onWaitlistClick?.();
                    }}
                    className={[
                      "w-full btn-pill btn-primary",
                      "py-3.5 font-display font-bold text-base",
                    ].join(" ")}
                  >
                    Join Waitlist
                  </button>
                </motion.div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
