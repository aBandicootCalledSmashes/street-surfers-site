"use client";

/**
 * ST·SURFERS — RIDE SECTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Price Estimator widget with:
 *  - Address autocomplete via Nominatim (OpenStreetMap, free, no API key)
 *  - Route distance from OSRM (free public routing API)
 *  - Leaflet/OSM map preview (CartoDB dark tiles)
 *  - 3-way cost comparison: St·Surfers vs Uber vs Bolt
 *  - Bar race animation
 *  - 20-second idle trick state machine (idle → wiggle → reassure → slider)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { SS_PRICING, UBER_RATES, BOLT_DISCOUNT, LEGAL } from "@/lib/constants";
import type { GeoPoint } from "./MapPreview";

// ─────────────────────────────────────────────────────────────────────────────
// IDLE TRICK CONFIG — edit these numbers without touching the logic below
// ─────────────────────────────────────────────────────────────────────────────
const IDLE_CONFIG = {
  timerStart:    20,   // seconds of inactivity before wiggle triggers
  phase2Delay:    5,   // seconds after wiggle for reassurance text
  phase3Delay:    8,   // seconds after wiggle for slider expansion
  budgetMin:    200,   // rand — slider minimum
  budgetMax:   2500,   // rand — slider maximum
  budgetStep:    50,   // rand — slider step
  budgetDefault: 800,  // rand — slider default position
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC MAP IMPORT — SSR disabled (Leaflet requires window/document)
// ─────────────────────────────────────────────────────────────────────────────
const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-ss-surface-2">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-ss-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-ss-white-muted text-sm font-body">Just a sec…</p>
      </div>
    </div>
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

type DistanceTier = "tier1" | "tier2" | "tier3";
type IdleState = 0 | 1 | 2 | 3;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTier(km: number): DistanceTier {
  if (km <= 10) return "tier1";
  if (km <= 24) return "tier2";
  return "tier3";
}

function calcSS(tier: DistanceTier, passengers: number, tripsPerDay: number, days: number): number {
  return (
    SS_PRICING[tier].ratePerPerson *
    passengers *
    tripsPerDay *
    days *
    SS_PRICING.weeksPerMonth
  );
}

function calcUber(tier: DistanceTier, tripsPerDay: number, days: number): number {
  const rateMap = {
    tier1: UBER_RATES.shortTrip,
    tier2: UBER_RATES.medTrip,
    tier3: UBER_RATES.longTrip,
  };
  const r = rateMap[tier];
  return r.avgFare * r.surgeMult * tripsPerDay * days * SS_PRICING.weeksPerMonth;
}

function formatR(amount: number): string {
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIER_OPTIONS: { value: DistanceTier; label: string }[] = [
  { value: "tier1", label: "Short trip (5–10 km)" },
  { value: "tier2", label: "Medium trip (11–24 km)" },
  { value: "tier3", label: "Long trip (over 24 km)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS INPUT SUB-COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function AddressInput({
  label,
  iconEl,
  value,
  placeholder,
  suggestions,
  isSelected,
  onQueryChange,
  onSelect,
}: {
  label: string;
  iconEl: React.ReactNode;
  value: string;
  placeholder: string;
  suggestions: NominatimResult[];
  isSelected: boolean;
  onQueryChange: (q: string) => void;
  onSelect: (r: NominatimResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-body text-ss-white-muted mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {iconEl}
        </span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          className={`w-full bg-ss-surface rounded-xl pl-10 pr-9 py-3 text-sm font-body transition-colors focus:outline-none border ${
            isSelected
              ? "border-ss-red text-ss-white"
              : "border-ss-white-faint text-ss-white placeholder:text-ss-white-muted focus:border-ss-red"
          }`}
        />
        {isSelected && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-ss-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111] border border-ss-white-faint rounded-xl overflow-hidden shadow-2xl"
          >
            {suggestions.slice(0, 5).map((s, i) => {
              const parts = s.display_name.split(", ");
              const primaryName = parts.slice(0, 3).join(", ");
              const secondaryName = parts.slice(3, 6).join(", ");
              return (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent input blur before click
                      onSelect(s);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-ss-surface transition-colors border-b border-ss-white-faint last:border-0 group"
                  >
                    <span className="text-ss-white text-sm block truncate group-hover:text-ss-red transition-colors">
                      {primaryName}
                    </span>
                    {secondaryName && (
                      <span className="text-ss-white-muted text-xs block truncate mt-0.5">
                        {secondaryName}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RideSection({
  onWaitlistClick,
}: {
  onWaitlistClick: (budget?: number, source?: string) => void;
}) {
  // ── Address / map state ────────────────────────────────────────────────────
  const [pickupQuery, setPickupQuery]   = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupSuggs,  setPickupSuggs]  = useState<NominatimResult[]>([]);
  const [dropoffSuggs, setDropoffSuggs] = useState<NominatimResult[]>([]);
  const [pickup,  setPickup]  = useState<GeoPoint | null>(null);
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null);
  const [routeShape, setRouteShape] = useState<[number, number][] | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const pickupDebounce  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropoffDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Error states ───────────────────────────────────────────────────────────
  const [addressError, setAddressError]         = useState<string | null>(null);
  const [isDistanceEstimate, setIsDistanceEstimate] = useState(false); // true = OSRM failed, using haversine

  // ── Schedule state ─────────────────────────────────────────────────────────
  const [manualTier, setManualTier]     = useState<DistanceTier>("tier1");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [tripsPerDay, setTripsPerDay]   = useState<1 | 2>(2);
  const [passengers, setPassengers]     = useState(1);
  const [riderType, setRiderType]       = useState<"staff" | "scholar">("staff");

  // ── Results / animation state ──────────────────────────────────────────────
  const [showResults,  setShowResults]  = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animateBars,  setAnimateBars]  = useState(false);

  // ── Idle trick state ───────────────────────────────────────────────────────
  const [idleState,   setIdleState]   = useState<IdleState>(0);
  const [budgetValue, setBudgetValue] = useState<number>(IDLE_CONFIG.budgetDefault);

  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase2Timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase3Timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef  = useRef<HTMLDivElement>(null);

  // ── Computed values ────────────────────────────────────────────────────────
  const activeTier = distanceKm != null ? getTier(distanceKm) : manualTier;
  const ssCost   = calcSS(activeTier, passengers, tripsPerDay, selectedDays.length);
  const uberCost = calcUber(activeTier, tripsPerDay, selectedDays.length);
  const boltCost = uberCost * BOLT_DISCOUNT;

  // Per-person SS cost for bar race + savings — fair 1-vs-1 comparison.
  // (ssCost scales with passengers; uberCost is per-vehicle. Using ssCost
  // directly causes negative savings when passengers ≥ 2 on short trips.)
  const ssPersonCost  = SS_PRICING[activeTier].ratePerPerson * tripsPerDay * selectedDays.length * SS_PRICING.weeksPerMonth;
  const savings       = uberCost - ssPersonCost;
  const annualSavings = savings * 12;

  const maxCost    = Math.max(uberCost, boltCost);
  const ssBarPct   = Math.round((ssPersonCost / maxCost) * 100);
  const boltBarPct = Math.round((boltCost / maxCost) * 100);

  // ── Nominatim geocoding (OSM, free, Gauteng-biased) ───────────────────────
  async function searchNominatim(
    query: string
  ): Promise<{ results: NominatimResult[]; networkError: boolean }> {
    if (query.length < 3) return { results: [], networkError: false };
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", `${query}, Gauteng`);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycodes", "za");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en" },
        signal: AbortSignal.timeout(8000), // 8s timeout
      });
      if (!res.ok) return { results: [], networkError: true };
      return { results: await res.json(), networkError: false };
    } catch (err: unknown) {
      // AbortError = timeout; TypeError = offline
      const isTimeout = err instanceof Error && err.name === "AbortError";
      return {
        results: [],
        networkError: true,
        ...(isTimeout ? {} : {}), // could differentiate later
      };
    }
  }

  function handlePickupChange(q: string) {
    setPickupQuery(q);
    setAddressError(null);
    if (pickup && q !== pickup.displayName.split(", ").slice(0, 3).join(", ")) {
      setPickup(null);
    }
    if (pickupDebounce.current) clearTimeout(pickupDebounce.current);
    pickupDebounce.current = setTimeout(async () => {
      const { results, networkError } = await searchNominatim(q);
      setPickupSuggs(results);
      if (networkError) {
        setAddressError("Location search is down right now — use the distance selector below instead 👇");
      }
    }, 300);
  }

  function handleDropoffChange(q: string) {
    setDropoffQuery(q);
    setAddressError(null);
    if (dropoff && q !== dropoff.displayName.split(", ").slice(0, 3).join(", ")) {
      setDropoff(null);
    }
    if (dropoffDebounce.current) clearTimeout(dropoffDebounce.current);
    dropoffDebounce.current = setTimeout(async () => {
      const { results, networkError } = await searchNominatim(q);
      setDropoffSuggs(results);
      if (networkError) {
        setAddressError("Location search is down right now — use the distance selector below instead 👇");
      }
    }, 300);
  }

  function selectPickup(r: NominatimResult) {
    const shortName = r.display_name.split(", ").slice(0, 3).join(", ");
    setPickup({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), displayName: r.display_name });
    setPickupQuery(shortName);
    setPickupSuggs([]);
  }

  function selectDropoff(r: NominatimResult) {
    const shortName = r.display_name.split(", ").slice(0, 3).join(", ");
    setDropoff({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), displayName: r.display_name });
    setDropoffQuery(shortName);
    setDropoffSuggs([]);
  }

  // ── Distance calculation when both points confirmed ────────────────────────
  useEffect(() => {
    if (!pickup || !dropoff) {
      setRouteShape(null);
      setDistanceKm(null);
      setIsDistanceEstimate(false);
      return;
    }

    // Immediate haversine estimate (crow-flies × 1.35 urban factor)
    const straight  = haversineKm(pickup.lat, pickup.lon, dropoff.lat, dropoff.lon);
    const estimated = Math.round(straight * 1.35);
    setDistanceKm(estimated);
    setIsDistanceEstimate(true); // flag as estimate until OSRM confirms

    // Refine with OSRM actual road distance + route shape
    const osrmUrl = [
      "https://router.project-osrm.org/route/v1/driving/",
      `${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}`,
      "?overview=full&geometries=geojson",
    ].join("");

    fetch(osrmUrl, { signal: AbortSignal.timeout(10000) })
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.[0]) {
          setDistanceKm(Math.round(data.routes[0].distance / 1000));
          setIsDistanceEstimate(false); // OSRM gave us the real road distance
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
          );
          setRouteShape(coords);
        }
      })
      .catch(() => {
        // Haversine estimate stays — isDistanceEstimate remains true
      });
  }, [pickup, dropoff]);

  // ── Idle trick timer management ────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (idleTimer.current)   clearTimeout(idleTimer.current);
    if (phase2Timer.current) clearTimeout(phase2Timer.current);
    if (phase3Timer.current) clearTimeout(phase3Timer.current);
  }, []);

  const startIdleTimer = useCallback(() => {
    clearAllTimers();
    setIdleState(0);
    idleTimer.current = setTimeout(() => {
      setIdleState(1);
      phase2Timer.current = setTimeout(
        () => setIdleState((prev) => (prev >= 1 ? 2 : prev)),
        IDLE_CONFIG.phase2Delay * 1000
      );
      phase3Timer.current = setTimeout(
        () => setIdleState((prev) => (prev >= 2 ? 3 : prev)),
        IDLE_CONFIG.phase3Delay * 1000
      );
    }, IDLE_CONFIG.timerStart * 1000);
  }, [clearAllTimers]);

  const resetIdleTimer = useCallback(() => {
    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    if (showResults) {
      setTimeout(() => setAnimateBars(true), 350);
      startIdleTimer();
    } else {
      setAnimateBars(false);
      clearAllTimers();
      setIdleState(0);
    }
    return clearAllTimers;
  }, [showResults, startIdleTimer, clearAllTimers]);

  // ── Calculate handler ──────────────────────────────────────────────────────
  async function handleCalculate() {
    if (selectedDays.length === 0) return;
    setIsCalculating(true);
    setShowResults(false);
    setAnimateBars(false);
    await new Promise((r) => setTimeout(r, 600));
    setIsCalculating(false);
    setShowResults(true);
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section
      id="ride"
      className="relative bg-ss-black section-py bg-map-texture"
      aria-labelledby="ride-heading"
    >
      <div className="container-site">

        {/* ── SECTION HEADER ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <span className="accent-line mb-5 block" aria-hidden="true" />
          <p className="font-body text-xs text-ss-red uppercase tracking-widest mb-3">
            For Riders
          </p>
          <h2
            id="ride-heading"
            className="font-display font-extrabold text-ss-white text-4xl md:text-5xl mb-4 leading-tight"
          >
            See what your commute actually costs.
          </h2>
          <p className="text-ss-white-muted font-body text-lg max-w-xl">
            Enter your route and schedule. We&apos;ll show you what St·Surfers costs — vs what you&apos;re paying now.
          </p>
        </div>

        {/* ── ESTIMATOR WIDGET ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ── LEFT: Inputs panel ──────────────────────────────────── */}
            <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-ss-white-faint">

              {/* ── Route inputs ── */}
              <div className="mb-6">
                <p className="text-xs font-body text-ss-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ss-red rounded-full inline-block" />
                  Your route
                </p>
                <div className="space-y-3">
                  <AddressInput
                    label="Pickup location"
                    iconEl={
                      <svg className="w-4 h-4 text-ss-white-muted" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="5" />
                      </svg>
                    }
                    value={pickupQuery}
                    placeholder="e.g. Soweto, Eldorado Park"
                    suggestions={pickupSuggs}
                    isSelected={!!pickup}
                    onQueryChange={handlePickupChange}
                    onSelect={selectPickup}
                  />
                  <AddressInput
                    label="Drop-off location"
                    iconEl={
                      <svg className="w-4 h-4 text-ss-red" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    }
                    value={dropoffQuery}
                    placeholder="e.g. Johannesburg CBD, Alberton"
                    suggestions={dropoffSuggs}
                    isSelected={!!dropoff}
                    onQueryChange={handleDropoffChange}
                    onSelect={selectDropoff}
                  />
                </div>

                {/* Address network error banner */}
                <AnimatePresence>
                  {addressError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-lg"
                      style={{ background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.25)" }}
                    >
                      <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      <span className="text-yellow-300 text-xs font-body flex-1">{addressError}</span>
                      <button onClick={() => setAddressError(null)} className="text-yellow-400 hover:text-white text-xs ml-1">×</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Distance result OR manual tier picker */}
                {distanceKm != null ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{ background: "rgba(208,28,0,0.1)", border: "1px solid rgba(208,28,0,0.25)" }}
                  >
                    <svg className="w-3.5 h-3.5 text-ss-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-ss-white-muted text-xs font-body">
                      {isDistanceEstimate ? "~" : ""}Route distance:{" "}
                      <span className="text-ss-white font-semibold">~{distanceKm} km</span>
                      {isDistanceEstimate && <span className="opacity-50 ml-1">(est.)</span>}
                    </span>
                    <button
                      onClick={() => {
                        setPickup(null);
                        setDropoff(null);
                        setPickupQuery("");
                        setDropoffQuery("");
                        setDistanceKm(null);
                        setRouteShape(null);
                      }}
                      className="ml-auto text-ss-white-muted hover:text-ss-white transition-colors text-xs"
                      title="Clear addresses"
                    >
                      ×
                    </button>
                  </motion.div>
                ) : (
                  <div className="mt-3">
                    <label className="block text-xs font-body text-ss-white-muted mb-1.5 uppercase tracking-wider">
                      Or select distance manually
                    </label>
                    <div className="relative">
                      <select
                        value={manualTier}
                        onChange={(e) => setManualTier(e.target.value as DistanceTier)}
                        className="w-full bg-ss-surface border border-ss-white-faint rounded-xl px-4 py-3 text-sm font-body text-ss-white focus:outline-none focus:border-ss-red transition-colors appearance-none cursor-pointer"
                      >
                        {TIER_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ss-white-muted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-ss-white-faint mb-6" />

              {/* ── Schedule ── */}
              <div className="mb-6">
                <p className="text-xs font-body text-ss-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ss-red rounded-full inline-block" />
                  Your schedule
                </p>

                {/* Day pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ALL_DAYS.map((day) => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                          active
                            ? "text-white"
                            : "bg-ss-surface-2 text-ss-white-muted hover:text-ss-white border border-ss-white-faint"
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: "#D01C00",
                                boxShadow: "0 0 12px rgba(208,28,0,0.4)",
                              }
                            : {}
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Trips per day */}
                <div className="flex gap-2">
                  {(
                    [
                      ["One way", 1 as const],
                      ["Return trip (×2)", 2 as const],
                    ] as const
                  ).map(([label, val]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTripsPerDay(val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-body font-semibold transition-all border ${
                        tripsPerDay === val
                          ? "text-white border-ss-red"
                          : "bg-ss-surface-2 border-ss-white-faint text-ss-white-muted hover:text-ss-white"
                      }`}
                      style={tripsPerDay === val ? { backgroundColor: "#D01C00" } : {}}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-ss-white-faint mb-6" />

              {/* ── Passengers ── */}
              <div className="mb-8">
                <p className="text-xs font-body text-ss-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ss-red rounded-full inline-block" />
                  Passengers
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Stepper */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      disabled={passengers <= 1}
                      className="w-9 h-9 rounded-full border border-ss-white-faint flex items-center justify-center text-ss-white text-xl hover:border-ss-red transition-colors disabled:opacity-30 leading-none"
                    >
                      −
                    </button>
                    <span className="font-display font-bold text-ss-white text-2xl w-6 text-center tabular-nums">
                      {passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.min(4, p + 1))}
                      disabled={passengers >= 4}
                      className="w-9 h-9 rounded-full border border-ss-white-faint flex items-center justify-center text-ss-white text-xl hover:border-ss-red transition-colors disabled:opacity-30 leading-none"
                    >
                      +
                    </button>
                    <span className="text-ss-white-muted text-sm font-body">
                      {passengers === 1 ? "person" : "people"}
                      <span className="opacity-50 ml-1">· max 4</span>
                    </span>
                  </div>

                  {/* Staff / Scholar toggle */}
                  <div
                    className="flex rounded-lg overflow-hidden border border-ss-white-faint"
                    role="group"
                    aria-label="Rider type"
                  >
                    {(["staff", "scholar"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRiderType(t)}
                        className={`px-4 py-1.5 text-xs font-body capitalize transition-colors ${
                          riderType === t
                            ? "bg-ss-surface-2 text-ss-white"
                            : "text-ss-white-muted hover:text-ss-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Calculate CTA ── */}
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating || selectedDays.length === 0}
                className="w-full py-4 rounded-xl font-display font-bold text-white uppercase tracking-widest text-sm transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ backgroundColor: "#D01C00" }}
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculating…
                  </>
                ) : (
                  "Calculate My Fare →"
                )}
              </button>

              {selectedDays.length === 0 && (
                <p className="text-center text-ss-red text-xs font-body mt-2">
                  Pick at least one travel day to get your estimate.
                </p>
              )}
              {!pickup && selectedDays.length > 0 && (
                <p className="text-center text-ss-white-muted text-xs font-body mt-2">
                  Add your route above for a more accurate distance 👆
                </p>
              )}
            </div>

            {/* ── RIGHT: Map panel ─────────────────────────────────────── */}
            <div className="relative min-h-[320px] lg:min-h-[520px]">
              <MapPreview
                pickup={pickup}
                dropoff={dropoff}
                routeShape={routeShape}
              />

              {/* Overlay prompt when no addresses entered yet */}
              {!pickup && !dropoff && (
                <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                  <div
                    className="mx-6 px-4 py-3 rounded-xl text-center"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-ss-white-muted font-body text-xs">
                      Enter your route above to see it on the map 👆
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RESULTS ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              onMouseMove={resetIdleTimer}
              onTouchStart={resetIdleTimer}
              onClick={resetIdleTimer}
              className="mt-8"
            >

              {/* ── 3 comparison cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                {/* St·Surfers — winner card */}
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background: "#0D0D0D",
                    border: "2px solid #D01C00",
                    boxShadow: "0 0 24px rgba(208,28,0,0.2)",
                  }}
                >
                  <div
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-body font-semibold"
                    style={{ backgroundColor: "#D01C00" }}
                  >
                    BEST VALUE 🏆
                  </div>
                  <p className="font-body text-ss-white-muted text-xs uppercase tracking-widest mb-2">
                    St·Surfers
                  </p>
                  <p className="font-display font-extrabold text-ss-white text-3xl mb-0.5">
                    {formatR(ssCost)}
                    <span className="text-sm text-ss-white-muted font-body font-normal">/month</span>
                  </p>
                  <p className="text-ss-white-muted text-sm font-body mb-5">
                    {formatR(ssCost / SS_PRICING.weeksPerMonth)} per week
                    {passengers > 1 && (
                      <span className="opacity-50 ml-1.5">· {passengers} people</span>
                    )}
                  </p>
                  <div className="h-2 bg-ss-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: animateBars ? `${ssBarPct}%` : 0 }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ backgroundColor: "#D01C00" }}
                    >
                      {/* Shimmer sweep — fires once bar has settled (~2.1s) */}
                      <motion.span
                        aria-hidden="true"
                        initial={{ x: "-100%" }}
                        animate={animateBars ? { x: "300%" } : {}}
                        transition={{ duration: 0.55, delay: 2.15, ease: "easeOut" }}
                        className="absolute inset-0 w-1/3 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Pulse glow — brief flash after bar fill celebrates the win */}
                  {animateBars && (
                    <motion.div
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.8, 0] }}
                      transition={{ duration: 0.9, delay: 2.0, times: [0, 0.25, 1] }}
                      className="h-[3px] rounded-full mt-0.5 pointer-events-none"
                      style={{
                        width:      `${ssBarPct}%`,
                        background: "#D01C00",
                        filter:     "blur(3px)",
                      }}
                    />
                  )}

                  <p className="text-xs font-body mt-1.5 text-ss-white-muted">
                    {ssBarPct}% of what Uber costs
                  </p>
                </div>

                {/* Uber */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="font-body text-ss-white-muted text-xs uppercase tracking-widest mb-2">
                    Uber (estimated)
                  </p>
                  <p className="font-display font-extrabold text-ss-white-muted text-3xl mb-0.5">
                    ~{formatR(uberCost)}
                    <span className="text-sm font-body font-normal">/month</span>
                  </p>
                  <p className="text-ss-white-muted text-sm font-body mb-5">
                    ~{formatR(uberCost / SS_PRICING.weeksPerMonth)} per week
                  </p>
                  <div className="h-2 bg-ss-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: animateBars ? "100%" : 0 }}
                      transition={{ duration: 1.2, delay: 0, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#555" }}
                    />
                  </div>
                  <p className="text-xs font-body mt-1.5 text-ss-white-muted">
                    *JHB average + peak surge
                  </p>
                </div>

                {/* Bolt */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <p className="font-body text-ss-white-muted text-xs uppercase tracking-widest mb-2">
                    Bolt (estimated)
                  </p>
                  <p className="font-display font-extrabold text-ss-white-muted text-3xl mb-0.5">
                    ~{formatR(boltCost)}
                    <span className="text-sm font-body font-normal">/month</span>
                  </p>
                  <p className="text-ss-white-muted text-sm font-body mb-5">
                    ~{formatR(boltCost / SS_PRICING.weeksPerMonth)} per week
                  </p>
                  <div className="h-2 bg-ss-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: animateBars ? `${boltBarPct}%` : 0 }}
                      transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: "#444" }}
                    />
                  </div>
                  <p className="text-xs font-body mt-1.5 text-ss-white-muted">
                    *~13% less than Uber on average
                  </p>
                </div>
              </div>

              {/* ── Savings callout ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: "rgba(208,28,0,0.1)",
                  border: "1px solid rgba(208,28,0,0.3)",
                }}
              >
                <div>
                  <p className="font-display font-extrabold text-ss-white text-2xl md:text-3xl">
                    Save {formatR(savings)} per person, per month
                  </p>
                  <p className="text-ss-white-muted font-body mt-1">
                    That&apos;s{" "}
                    <strong className="text-ss-white">{formatR(annualSavings)}</strong>{" "}
                    back in your pocket every year. Not bad.
                  </p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p
                    className="font-display font-extrabold text-4xl md:text-5xl"
                    style={{ color: "#D01C00" }}
                  >
                    {Math.round((savings / uberCost) * 100)}%
                  </p>
                  <p className="text-ss-white-muted text-xs font-body mt-0.5">
                    cheaper than Uber
                  </p>
                </div>
              </motion.div>

              {/* ── IDLE TRICK CTA AREA ──────────────────────────────────── */}
              <div className="max-w-md mx-auto text-center">

                {/* Bouncing 👀 emoji (state 1+) */}
                <AnimatePresence>
                  {idleState >= 1 && idleState < 3 && (
                    <motion.p
                      key="eyeballs"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: [0, -8, 0] }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{
                        opacity: { duration: 0.3 },
                        y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                      }}
                      className="text-2xl mb-3"
                    >
                      👀
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Normal + wiggling CTA button (states 0–2) */}
                <AnimatePresence mode="wait">
                  {idleState < 3 ? (
                    <motion.div key="normal-cta" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      <motion.button
                        type="button"
                        onClick={() => onWaitlistClick(undefined, "estimator-cta")}
                        animate={idleState === 1 ? { rotate: [-3, 3, -2.5, 2.5, -1.5, 1.5, 0] } : { rotate: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="w-full py-4 rounded-xl font-display font-bold uppercase tracking-widest text-white text-sm transition-colors"
                        style={{
                          backgroundColor: idleState >= 1 ? "#E8631A" : "#D01C00",
                          transition: "background-color 0.5s ease",
                        }}
                      >
                        {idleState === 0
                          ? "Join Waitlist to Lock In This Rate →"
                          : "Hmm… is the price a bit steep? 👀"}
                      </motion.button>

                      {/* State 2: reassurance text */}
                      <AnimatePresence>
                        {idleState >= 2 && (
                          <motion.p
                            key="reassurance"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-ss-white-muted font-body text-sm mt-3"
                          >
                            No stress — we&apos;ve got options. Let&apos;s work something out 💬
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (

                    /* ── State 3: Budget slider ── */
                    <motion.div
                      key="slider"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      {/* Slider thumb CSS — scoped to this component */}
                      <style>{`
                        .budget-slider { -webkit-appearance: none; appearance: none; }
                        .budget-slider::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          width: 24px; height: 24px;
                          border-radius: 50%;
                          background: #D01C00;
                          cursor: pointer;
                          box-shadow: 0 0 12px rgba(208,28,0,0.5);
                          transition: transform 0.15s ease, box-shadow 0.15s ease;
                        }
                        .budget-slider::-webkit-slider-thumb:hover {
                          transform: scale(1.2);
                          box-shadow: 0 0 18px rgba(208,28,0,0.7);
                        }
                        .budget-slider::-moz-range-thumb {
                          width: 24px; height: 24px;
                          border-radius: 50%;
                          background: #D01C00;
                          cursor: pointer;
                          border: none;
                          box-shadow: 0 0 12px rgba(208,28,0,0.5);
                        }
                      `}</style>

                      <div
                        className="rounded-2xl p-6 text-left"
                        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <p className="font-display font-bold text-ss-white text-base mb-5 text-center">
                          What can you comfortably budget per month?
                        </p>

                        {/* Live budget display */}
                        <div className="flex items-baseline justify-center gap-1 mb-5">
                          <span
                            className="font-display font-extrabold text-5xl tabular-nums"
                            style={{ color: "#D01C00" }}
                          >
                            R{budgetValue.toLocaleString("en-ZA")}
                          </span>
                          <span className="text-ss-white-muted font-body text-sm">/month</span>
                        </div>

                        {/* Range slider */}
                        <input
                          type="range"
                          min={IDLE_CONFIG.budgetMin}
                          max={IDLE_CONFIG.budgetMax}
                          step={IDLE_CONFIG.budgetStep}
                          value={budgetValue}
                          onChange={(e) => setBudgetValue(Number(e.target.value))}
                          className="budget-slider w-full h-2 rounded-full cursor-pointer mb-2 focus:outline-none"
                          style={{
                            background: `linear-gradient(to right, #D01C00 ${
                              ((budgetValue - IDLE_CONFIG.budgetMin) /
                                (IDLE_CONFIG.budgetMax - IDLE_CONFIG.budgetMin)) *
                              100
                            }%, rgba(255,255,255,0.1) 0%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-ss-white-muted font-body mb-5">
                          <span>R{IDLE_CONFIG.budgetMin}</span>
                          <span>R{IDLE_CONFIG.budgetMax.toLocaleString("en-ZA")}</span>
                        </div>

                        <p className="text-ss-white-muted font-body text-sm mb-5 text-center">
                          We&apos;ll find a St·Surfers plan for{" "}
                          <strong className="text-ss-white">
                            R{budgetValue.toLocaleString("en-ZA")}/month
                          </strong>
                          . Join the waitlist and we&apos;ll reach out with your options.
                        </p>

                        <button
                          type="button"
                          onClick={() => onWaitlistClick(budgetValue, "budget-slider")}
                          className="w-full py-4 rounded-xl font-display font-bold uppercase tracking-widest text-white text-sm mb-4 active:scale-[0.97] transition-transform"
                          style={{ backgroundColor: "#D01C00" }}
                        >
                          Save My Budget &amp; Join Waitlist →
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIdleState(0);
                            clearAllTimers();
                          }}
                          className="w-full text-ss-white-muted font-body text-xs hover:text-ss-white transition-colors text-center"
                        >
                          ← Back to standard pricing
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Legal disclaimer */}
              <p className="text-center text-ss-white-muted font-body text-xs mt-8 max-w-2xl mx-auto opacity-50">
                {LEGAL.disclaimer} {LEGAL.estimateNotice}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
