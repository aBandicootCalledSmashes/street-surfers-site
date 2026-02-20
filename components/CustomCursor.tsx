"use client";

/**
 * ST·SURFERS — CUSTOM CURSOR
 * ──────────────────────────────────────────────────────────────────
 * Desktop only (disabled on touch/hover:none devices).
 *
 * Two-layer cursor:
 *  • Inner dot  — 8px, #D01C00, mix-blend-mode: difference, follows exactly
 *  • Outer ring — 32px, rgba(208,28,0,0.4) border, lags with lerp @ 0.12
 *
 * State changes (CSS transitions, not React re-renders):
 *  • Hover over CTAs (button/a/[role=button]): ring expands → 48px + red fill
 *  • Hover over [data-cursor="card"]: ring → square (border-radius 4px)
 *  • Normal: 32px pill ring
 *
 * Position updates use direct DOM style mutation (not React state)
 * for 60fps performance — only cursorState uses React state.
 * ──────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";

type CursorState = "normal" | "cta" | "card";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Target position (updated on every mousemove)
  const targetRef  = useRef({ x: -100, y: -100 });
  // Current lerped position (ring)
  const currentRef = useRef({ x: -100, y: -100 });
  const rafRef     = useRef<number>(0);

  const [cursorState, setCursorState] = useState<CursorState>("normal");
  const [isTouchDevice, setIsTouchDevice] = useState(true); // safe default = disabled

  useEffect(() => {
    // Detect touch/pointer-only devices; disable on those
    const isTouch = window.matchMedia("(hover: none)").matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    // Suppress native cursor globally
    const styleEl = document.createElement("style");
    styleEl.id = "ss-custom-cursor-style";
    styleEl.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(styleEl);

    // ── Mouse move: dot follows exactly ──
    function onMouseMove(e: MouseEvent) {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;

      // Update dot immediately (no lag)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
        dotRef.current.style.opacity = "1";
      }

      // Determine hover context
      const el = e.target as HTMLElement;
      const isCta  = !!el.closest("button, a[href], [role='button']");
      const isCard = !isCta && !!el.closest("[data-cursor='card']");
      const next: CursorState = isCta ? "cta" : isCard ? "card" : "normal";
      setCursorState(prev => prev !== next ? next : prev);
    }

    function onMouseLeave() {
      if (dotRef.current)  dotRef.current.style.opacity  = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    }

    function onMouseEnter() {
      if (dotRef.current)  dotRef.current.style.opacity  = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    }

    // ── RAF loop: outer ring lerps toward cursor ──
    function animateRing() {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      // Fast lerp — ~100ms natural lag at 60fps
      currentRef.current.x += dx * 0.12;
      currentRef.current.y += dy * 0.12;

      if (ringRef.current) {
        const { x, y } = currentRef.current;
        ringRef.current.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
        ringRef.current.style.opacity = dotRef.current?.style.opacity ?? "0";
      }

      rafRef.current = requestAnimationFrame(animateRing);
    }

    rafRef.current = requestAnimationFrame(animateRing);

    document.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      document.getElementById("ss-custom-cursor-style")?.remove();
      document.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // runs once

  // Don't render on touch devices
  if (isTouchDevice) return null;

  // Ring dimensions — updated via React state (infrequent changes)
  const ringSize = cursorState === "cta" ? 48 : 32;
  const ringBR   = cursorState === "card" ? 4 : 9999;
  const ringFill = cursorState === "cta" ? "rgba(208,28,0,0.1)" : "transparent";

  return (
    <>
      {/* ── Inner dot ── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          width:           8,
          height:          8,
          borderRadius:    "50%",
          backgroundColor: "#D01C00",
          mixBlendMode:    "difference",
          opacity:         0,
          pointerEvents:   "none",
          zIndex:          9999,
          willChange:      "transform",
          transition:      "opacity 150ms ease",
        }}
      />

      {/* ── Outer ring ── */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          width:           ringSize,
          height:          ringSize,
          borderRadius:    ringBR,
          border:          "1px solid rgba(208,28,0,0.4)",
          backgroundColor: ringFill,
          opacity:         0,
          pointerEvents:   "none",
          zIndex:          9998,
          willChange:      "transform",
          // CSS transitions handle shape/size changes
          transition: [
            "width 200ms ease",
            "height 200ms ease",
            "border-radius 200ms ease",
            "background-color 200ms ease",
            "opacity 150ms ease",
          ].join(", "),
        }}
      />
    </>
  );
}
