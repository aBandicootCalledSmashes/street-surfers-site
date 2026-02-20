/**
 * ST·SURFERS — OFFICIAL CONSTANTS
 * Single source of truth for all data used across the site.
 * Mirrors the knowledge base exactly. Never guess values — check here first.
 */

// ─── BRAND ────────────────────────────────────────────────────────────────────

export const BRAND = {
  name:      "St·Surfers",
  fullName:  "Street Surfers South-Side Shuttles",
  tagline:   "South-Side Shuttles",
  regNo:     "2024/681346/07",
  founded:   "2024/07",
  website:   "streetsurfers.com",
} as const;

// ─── CONTACT ──────────────────────────────────────────────────────────────────

export const CONTACT = {
  phone:      "+27 69 164 3842",
  phoneAlt:   "011 624 0024",
  whatsapp:   "+27 69 164 3842",
  email:      "info@streetsurfers.com",
  emailFounder: "nsizwamanyathi7@gmail.com",
} as const;

// ─── PRICING ──────────────────────────────────────────────────────────────────

export const SS_PRICING = {
  tier1: { minKm: 5,  maxKm: 10,  ratePerPerson: 60,  label: "Short trip (5–10 km)" },
  tier2: { minKm: 11, maxKm: 24,  ratePerPerson: 80,  label: "Medium trip (11–24 km)" },
  tier3: { minKm: 25, maxKm: 999, ratePerPerson: 110, label: "Long trip (over 24 km)" },
  workingDaysPerMonth: 22,
  weekendDaysPerMonth: 8,
  weeksPerMonth: 4.33,
  callOutFee: 1000, // 7-day flat fee
} as const;

export const UBER_RATES = {
  shortTrip: { minKm: 0,  maxKm: 10, avgFare: 65,  surgeMult: 1.5 },
  medTrip:   { minKm: 11, maxKm: 24, avgFare: 130, surgeMult: 1.8 },
  longTrip:  { minKm: 25, maxKm: 50, avgFare: 220, surgeMult: 2.0 },
} as const;

export const BOLT_DISCOUNT = 0.87; // Bolt is ~13% cheaper than Uber

// ─── OPERATING HOURS ──────────────────────────────────────────────────────────

export const HOURS = {
  open:  "4:00am",
  close: "11:00pm",
  days:  "Weekdays & Weekends",
} as const;

// ─── COVERAGE AREAS (waitlist dropdown) ───────────────────────────────────────

export const COVERAGE_AREAS = [
  "Soweto",
  "Eldorado Park",
  "Ennerdale",
  "Lenasia",
  "Roodepoort",
  "Johannesburg CBD",
  "Germiston",
  "Alberton",
  "Other",
] as const;

// ─── COVERAGE SECTION — DISPLAY DATA ──────────────────────────────────────────

export const COVERAGE_PRIMARY = [
  "Soweto",
  "Eldorado Park",
  "Ennerdale",
  "Lenasia",
  "Roodepoort",
  "Johannesburg CBD",
] as const;

export const COVERAGE_EXPANDING = [
  "Pretoria",
  "Germiston",
  "Alberton",
  "Midrand",
  "Kempton Park",
  "Randburg",
  "Sandton",
  "Edenvale",
] as const;

// ─── REFERRAL SOURCES (waitlist dropdown) ─────────────────────────────────────

export const REFERRAL_SOURCES = [
  "Word of mouth",
  "Instagram",
  "Facebook",
  "TikTok",
  "WhatsApp",
  "Google",
  "Other",
] as const;

// ─── RIDER TYPES ──────────────────────────────────────────────────────────────

export const RIDER_TYPES = [
  { value: "staff",    label: "Staff Member" },
  { value: "scholar",  label: "Scholar" },
  { value: "parent",   label: "Parent / Guardian" },
  { value: "employer", label: "Employer" },
] as const;

// ─── BENEFITS (7 official rider benefits) ─────────────────────────────────────

export const RIDER_BENEFITS = [
  {
    title:       "Guaranteed Seat",
    description: "Your seat is auto-reserved for all scheduled trips. No more full rides.",
    icon:        "seat",
  },
  {
    title:       "Fixed & Transparent Pricing",
    description: "No surge. No hidden fees. R60, R80, or R110 per trip — always.",
    icon:        "price",
  },
  {
    title:       "Reliable & Punctual",
    description: "Professional drivers committed to your scheduled times. Every time.",
    icon:        "clock",
  },
  {
    title:       "Safety Commitment",
    description: "All vehicles regularly maintained, fully insured. Seatbelts required.",
    icon:        "shield",
  },
  {
    title:       "Loyalty Rewards",
    description: "Discounted fares after set trips, exclusive offers, referral bonuses.",
    icon:        "star",
  },
  {
    title:       "Door-to-Door",
    description: "Pickup and drop-off within your zone. We minimize your walking distance.",
    icon:        "door",
  },
  {
    title:       "Dedicated Support",
    description: "Phone, WhatsApp (+27 69 164 3842), or email — we\u2019re here.",
    icon:        "support",
  },
] as const;

// ─── NAV LINKS ────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Ride",         href: "#ride" },
  { label: "Drive",        href: "#drive" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Safety",       href: "#safety" },
] as const;

// ─── LEGAL COPY ───────────────────────────────────────────────────────────────

export const LEGAL = {
  copyright:       `© ${new Date().getFullYear()} Street Surfers South-Side Shuttles. All rights reserved.`,
  registered:      "Street Surfers (2024/681346/07) is a registered South African business.",
  disclaimer:      "St·Surfers is not affiliated with Uber Technologies or Bolt. Price comparisons are market estimates only and do not constitute a guaranteed quote.",
  estimateNotice:  "Estimates shown are indicative only. Final pricing confirmed upon booking.",
  popia:           "Your personal information is collected and processed in accordance with the Protection of Personal Information Act (POPIA).",
} as const;

// ─── TESTIMONIALS (placeholder — replace with real quotes post-launch) ────────
// ⚠️  These are illustrative placeholder quotes for pre-launch. Replace with
//     verified customer quotes and real photos before going live.

export const TESTIMONIALS = [
  {
    name:   "Thabo Nkosi",
    role:   "Admin Manager · Soweto → Sandton daily commute",
    avatar: "/assets/photos/testimonial-thabo.jpg", // placeholder
    quote:
      "Used to spend over R2,400 a month on Uber just to get to work. With St·Surfers I know exactly what I'm paying — and my seat is always there.",
    pexelsQuery: "professional black man commuting south africa", // → replace avatar
  },
  {
    name:   "Nomvula Dlamini",
    role:   "Parent · Protea North, Soweto",
    avatar: "/assets/photos/testimonial-nomvula.jpg", // placeholder
    quote:
      "My daughter travels every morning with St·Surfers. Same driver, same time, every day. I drop her off knowing she'll arrive safe.",
    pexelsQuery: "south african mother child school morning", // → replace avatar
  },
  {
    name:   "Sipho Mahlangu",
    role:   "Driver Partner · Eldorado Park",
    avatar: "/assets/photos/testimonial-sipho.jpg", // placeholder
    quote:
      "The fixed contracts changed everything for me. I know my routes, I know my riders, and I know what I'm earning each month. No more chasing trips.",
    pexelsQuery: "professional black driver car south africa", // → replace avatar
  },
] as const;

// ─── PRICE CALCULATION HELPERS ────────────────────────────────────────────────

export function getSSPricingTier(distanceKm: number) {
  if (distanceKm <= 10) return SS_PRICING.tier1;
  if (distanceKm <= 24) return SS_PRICING.tier2;
  return SS_PRICING.tier3;
}

export function calcSSMonthlyCost({
  distanceKm,
  passengers,
  tripsPerDay,
  daysPerWeek,
}: {
  distanceKm:  number;
  passengers:  number;
  tripsPerDay: number; // 1 = one-way, 2 = return
  daysPerWeek: number;
}) {
  const tier = getSSPricingTier(distanceKm);
  return tier.ratePerPerson * passengers * tripsPerDay * daysPerWeek * SS_PRICING.weeksPerMonth;
}

export function calcUberMonthlyCost({
  distanceKm,
  tripsPerDay,
  daysPerWeek,
}: {
  distanceKm:  number;
  tripsPerDay: number;
  daysPerWeek: number;
}) {
  const rate =
    distanceKm > 24  ? UBER_RATES.longTrip  :
    distanceKm > 10  ? UBER_RATES.medTrip   :
                       UBER_RATES.shortTrip;
  return rate.avgFare * rate.surgeMult * tripsPerDay * daysPerWeek * SS_PRICING.weeksPerMonth;
}
