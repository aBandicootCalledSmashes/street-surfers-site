import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

/**
 * FONTS
 * ─────────────────────────────────────────────────────────────
 * Syne ExtraBold — active display font, the brand-approved
 * Google Fonts fallback for Panchang Variable.
 * KB typography section: "Fallback Display: 'Syne' (800)"
 * Uses --font-panchang CSS variable so swap to Panchang is
 * seamless: download woff2 → switch to next/font/local.
 *
 * DM Sans — body copy, brand-approved alt for Acumin Variable.
 * Both injected as CSS variables consumed by tokens.css.
 * ─────────────────────────────────────────────────────────────
 */

// Display font — Syne (confirmed Google Fonts, next/font optimized)
const syne = Syne({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  variable: "--font-panchang", // same CSS var → swap to Panchang woff2 is seamless
  display:  "swap",
});

// Body font — DM Sans (confirmed Google Fonts, next/font optimized)
const dmSans = DM_Sans({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display:  "swap",
});

// ── METADATA ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://streetsurfers.com"),

  title:       "St·Surfers — South-Side Shuttles | Johannesburg",
  description: "Safe, scheduled, fixed-price shuttle transport for staff and scholars in Johannesburg. No surge pricing. No surprises. Join the waitlist.",

  keywords: [
    "shuttle service Johannesburg",
    "staff transport JHB",
    "scholar transport Soweto",
    "South Side shuttles",
    "St Surfers",
    "street surfers",
    "commute Johannesburg",
    "no surge pricing shuttle",
    "school transport Johannesburg",
  ],

  authors: [{ name: "Street Surfers South-Side Shuttles" }],

  openGraph: {
    type:        "website",
    url:         "https://streetsurfers.com",
    title:       "St·Surfers — Your Joburg ride, sorted.",
    description: "Fixed-price. No surge. Your seat is always booked — not hoped for. Join the waitlist for Joburg's best shuttle service.",
    siteName:    "St·Surfers",
    // OG image auto-served from app/opengraph-image.jpg (Next.js App Router)
  },

  twitter: {
    card:        "summary_large_image",
    title:       "St·Surfers — Your Joburg ride, sorted.",
    description: "Fixed-price. No surge. Your seat is always booked — not hoped for.",
    // Twitter image auto-served from app/twitter-image.jpg (Next.js App Router)
  },

  robots: {
    index:  true,
    follow: true,
  },

  icons: {
    icon:  "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// ── VIEWPORT / THEME ──────────────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor:   "#D01C00",  // Brand red — shows in mobile browser chrome bar
  colorScheme:  "dark",
  width:        "device-width",
  initialScale: 1,
};

// ── ROOT LAYOUT ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // CSS variables injected onto <html>, consumed by tokens.css + Tailwind:
      // --font-panchang = Syne (→ swap to Panchang woff2 when downloaded)
      // --font-dm-sans  = DM Sans
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
