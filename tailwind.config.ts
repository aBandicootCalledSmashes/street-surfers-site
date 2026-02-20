import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── St·Surfers Brand Colours ──────────────────────────────────
        // Solid colours — usable as bg-*, text-*, border-*, fill-*
        "ss-black":     "#000000",
        "ss-white":     "#FFFFFF",
        "ss-red":       "#D01C00",
        "ss-red-dark":  "#A01500",
        "ss-surface":   "#0D0D0D",
        "ss-surface-2": "#1A1A1A",

        // Semi-transparent colours — pre-baked rgba values
        // (Tailwind opacity modifiers don't apply to these)
        "ss-red-glow":     "rgba(208, 28, 0, 0.25)",
        "ss-white-muted":  "rgba(255, 255, 255, 0.6)",
        "ss-white-faint":  "rgba(255, 255, 255, 0.08)",
        "ss-white-subtle": "rgba(255, 255, 255, 0.04)",
      },

      fontFamily: {
        // CSS variable fonts — set by next/font in layout.tsx
        display: ["var(--font-panchang)", "Syne", "sans-serif"],
        body:    ["var(--font-dm-sans)",  "DM Sans", "sans-serif"],
      },

      backgroundImage: {
        "gradient-brand":    "linear-gradient(135deg, #000000 0%, #D01C00 100%)",
        "gradient-brand-45": "linear-gradient(45deg, #000000 0%, #D01C00 100%)",
        "gradient-red-fade": "linear-gradient(180deg, rgba(208,28,0,0.15) 0%, transparent 100%)",
      },

      boxShadow: {
        "red-glow":    "0 0 24px rgba(208, 28, 0, 0.25)",
        "red-glow-lg": "0 0 48px rgba(208, 28, 0, 0.35)",
        "red-glow-xl": "0 0 80px rgba(208, 28, 0, 0.45)",
      },

      // Spacing scale: 4px base (matches brand design grid)
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // Z-index scale for layering
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },

      // Reusable keyframes for brand animations
      animation: {
        "fade-up":      "fadeUp 0.6s ease forwards",
        "fade-up-slow": "fadeUp 0.9s ease forwards",
        "fade-in":      "fadeIn 0.4s ease forwards",
        "wiggle":       "wiggle 0.4s ease 3",          // idle CTA trick
        "bounce-soft":  "bounceSoft 1.2s ease-in-out infinite",
        "slide-down":   "slideDown 0.25s ease forwards",
        "race-bar":     "raceBar 1.2s ease-out forwards", // comparison bars
        "pulse-red":    "pulseRed 2s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "20%":      { transform: "rotate(-4deg) scale(1.03)" },
          "60%":      { transform: "rotate(4deg) scale(1.03)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        raceBar: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--bar-width, 100%)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(208,28,0,0.3)" },
          "50%":      { boxShadow: "0 0 28px rgba(208,28,0,0.6)" },
        },
      },

      // Screen size helpers
      screens: {
        "xs": "475px",
      },
    },
  },
  plugins: [],
};

export default config;
