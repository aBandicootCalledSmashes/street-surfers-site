"use client";

/**
 * MapPreview — OpenStreetMap-backed route map for the Price Estimator.
 * Uses CartoDB dark tiles (free, no API key) for brand-consistent dark look.
 * Dynamically imported with ssr:false — Leaflet requires window.
 *
 * Gauteng, South Africa focus. Default center: JHB South Side.
 */

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

export interface GeoPoint {
  lat: number;
  lon: number;
  displayName: string;
}

interface MapPreviewProps {
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
  routeShape: [number, number][] | null;
}

// ─── Custom brand-styled marker icons (SVG DivIcons — no webpack asset issues) ─

const pickupIcon = L.divIcon({
  className: "",
  html: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill="#000000" stroke="#ffffff" stroke-width="2"/>
    <circle cx="10" cy="10" r="4" fill="#ffffff"/>
  </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 7.714 12 20 12 20s12-12.286 12-20C24 5.373 18.627 0 12 0z" fill="#D01C00"/>
    <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
  </svg>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32],
});

// ─── Auto-fit bounds helper (must be rendered inside MapContainer) ─────────────

function BoundsFitter({
  pickup,
  dropoff,
}: {
  pickup: GeoPoint | null;
  dropoff: GeoPoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon]
      );
      map.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.8 });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lon], 13, { animate: true, duration: 0.8 });
    } else if (dropoff) {
      map.flyTo([dropoff.lat, dropoff.lon], 13, { animate: true, duration: 0.8 });
    }
  }, [pickup, dropoff, map]);

  return null;
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MapPreview({ pickup, dropoff, routeShape }: MapPreviewProps) {
  return (
    <>
      {/* Override Leaflet container background for dark theme */}
      <style>{`
        .leaflet-container {
          background: #0d0d0d !important;
          isolation: isolate;
        }
        .leaflet-tile-pane { filter: brightness(0.9); }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.6) !important;
          color: rgba(255,255,255,0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.5) !important; }
      `}</style>

      <MapContainer
        center={[-26.2708, 27.9958]} /* JHB South Side */
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight: "320px" }}
      >
        {/* CartoDB dark tiles — free, no API key, great for dark UIs */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
          subdomains="abcd"
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon} />
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lon]} icon={dropoffIcon} />
        )}

        {routeShape && routeShape.length > 0 && (
          <Polyline
            positions={routeShape}
            color="#D01C00"
            weight={4}
            opacity={0.85}
            smoothFactor={1}
          />
        )}

        <BoundsFitter pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </>
  );
}
