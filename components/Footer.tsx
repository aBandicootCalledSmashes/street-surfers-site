"use client";

import Link from "next/link";
import { BRAND, CONTACT } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterProps {
  onWaitlistClick?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-display font-bold uppercase tracking-widest mb-5"
      style={{ color: "#D01C00", fontSize: "0.72rem", letterSpacing: "0.12em" }}
    >
      {children}
    </p>
  );
}

function FooterLink({
  href,
  children,
  onClick,
  external,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
}) {
  const baseStyle = { color: "rgba(255,255,255,0.5)" };
  const hoverStyle = { color: "#D01C00" };
  const className = "font-body text-sm transition-colors text-left";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={className}
        style={baseStyle}
        onMouseEnter={(e) =>
          Object.assign((e.currentTarget as HTMLElement).style, hoverStyle)
        }
        onMouseLeave={(e) =>
          Object.assign((e.currentTarget as HTMLElement).style, baseStyle)
        }
      >
        {children}
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={baseStyle}
        onMouseEnter={(e) =>
          Object.assign((e.currentTarget as HTMLAnchorElement).style, hoverStyle)
        }
        onMouseLeave={(e) =>
          Object.assign(
            (e.currentTarget as HTMLAnchorElement).style,
            baseStyle
          )
        }
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href || "#"}
      className={className}
      style={baseStyle}
      onMouseEnter={(e) =>
        Object.assign((e.currentTarget as HTMLAnchorElement).style, hoverStyle)
      }
      onMouseLeave={(e) =>
        Object.assign((e.currentTarget as HTMLAnchorElement).style, baseStyle)
      }
    >
      {children}
    </Link>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/streetsurfers",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/streetsurfers",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@streetsurfers",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.13a4.85 4.85 0 01-1-.44z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/streetsurfers",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

// ─── App store badge ──────────────────────────────────────────────────────────

function AppBadge({ store }: { store: "apple" | "google" }) {
  return (
    <div
      className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl cursor-not-allowed select-none"
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        opacity: 0.6,
      }}
      title={`${store === "apple" ? "App Store" : "Google Play"} — Coming soon`}
    >
      {store === "apple" ? (
        /* Apple logo */
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.8)" }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        /* Google Play triangle */
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.8)" }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M3 20.5v-17c0-.83 1.01-1.3 1.7-.8l14.5 8.5c.65.38.65 1.32 0 1.7L4.7 21.3c-.69.5-1.7.03-1.7-.8zM5 7.06V16.94L13.03 12 5 7.06z" />
        </svg>
      )}
      <div className="leading-none">
        <p
          className="font-body"
          style={{
            fontSize: "0.58rem",
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.03em",
          }}
        >
          {store === "apple" ? "Download on the" : "Get it on"}
        </p>
        <p
          className="font-display font-bold text-white"
          style={{ fontSize: "0.78rem" }}
        >
          {store === "apple" ? "App Store" : "Google Play"}
        </p>
        <p
          className="font-body font-semibold"
          style={{ fontSize: "0.55rem", color: "#D01C00", letterSpacing: "0.06em" }}
        >
          — SOON
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Footer({ onWaitlistClick }: FooterProps) {
  return (
    <footer
      className="relative"
      style={{ background: "#000000", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      aria-label="Site footer"
    >
      <div className="container-site pt-16 pb-0">

        {/* ── Four columns ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.9fr_1fr_1fr_1.5fr] gap-12 mb-14">

          {/* ── Column 1: Brand ─────────────────────────────────────────── */}
          <div>
            {/* Wordmark */}
            <div className="mb-4 flex flex-col leading-none">
              <span
                className="font-display font-extrabold text-white tracking-tight"
                style={{ fontSize: "1.2rem" }}
              >
                St·Surfers
              </span>
              <span
                className="font-body text-ss-red uppercase tracking-widest mt-0.5"
                style={{ fontSize: "0.6rem", letterSpacing: "0.14em" }}
              >
                South-Side Shuttles
              </span>
            </div>

            {/* Tagline */}
            <p
              className="font-body italic mb-6"
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}
            >
              Safe routes. Fixed prices. Joburg proud.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mb-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(208,28,0,0.14)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(208,28,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.45)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "rgba(255,255,255,0.06)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* App store badges */}
            <div className="flex flex-wrap gap-2">
              <AppBadge store="apple" />
              <AppBadge store="google" />
            </div>
          </div>

          {/* ── Column 2: For Riders ─────────────────────────────────────── */}
          <div>
            <ColHeading>Ride</ColHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink onClick={onWaitlistClick}>Join Waitlist</FooterLink>
              </li>
              <li>
                <FooterLink href="#how-it-works">How It Works</FooterLink>
              </li>
              <li>
                <FooterLink href="#ride">Price Estimator</FooterLink>
              </li>
              <li>
                <FooterLink href="#safety">Safety &amp; Standards</FooterLink>
              </li>
              <li>
                <FooterLink href="#benefits">Rider Benefits</FooterLink>
              </li>
              <li>
                <FooterLink href="#">FAQ</FooterLink>
              </li>
            </ul>
          </div>

          {/* ── Column 3: For Drivers ────────────────────────────────────── */}
          <div>
            <ColHeading>Drive</ColHeading>
            <ul className="space-y-3">
              <li>
                <FooterLink href="#drive">Become a Driver Partner</FooterLink>
              </li>
              <li>
                <FooterLink href="#drive">Driver Requirements</FooterLink>
              </li>
              <li>
                <FooterLink href="#drive">How to Apply</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Driver FAQ</FooterLink>
              </li>
            </ul>
          </div>

          {/* ── Column 4: Company & Contact ──────────────────────────────── */}
          <div>
            <ColHeading>St·Surfers</ColHeading>

            {/* Contact details */}
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
                  className="flex items-start gap-2 font-body text-sm group"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneAlt.replace(/\D/g, "")}`}
                  className="flex items-start gap-2 font-body text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {CONTACT.phoneAlt}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 font-body text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp: {CONTACT.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-start gap-2 font-body text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://${BRAND.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 font-body text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#D01C00")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.5)")
                  }
                >
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  {BRAND.website}
                </a>
              </li>
            </ul>

            {/* Legal links */}
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="#">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Terms of Service</FooterLink>
              </li>
              <li>
                <FooterLink href="#about">About Us</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* ── POPIA notice ──────────────────────────────────────────────── */}
        <div
          className="rounded-xl px-6 py-4 mb-0"
          style={{
            background: "#0D0D0D",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
            St·Surfers collects and processes personal information in compliance
            with the{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              Protection of Personal Information Act (POPIA)
            </span>
            . All data is used solely for service delivery and communication.{" "}
            <a
              href="#"
              className="underline underline-offset-2 transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#D01C00")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.45)")
              }
            >
              View our Privacy Policy.
            </a>
          </p>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Left: copyright + reg */}
          <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
            © {new Date().getFullYear()} Street Surfers South-Side Shuttles ({BRAND.regNo}). All rights reserved.
          </p>

          {/* Center: disclaimer */}
          <p
            className="font-body text-xs text-center"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Not affiliated with Uber or Bolt.
          </p>

          {/* Right: built with */}
          <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
            Built with 🏄 in Johannesburg 🇿🇦
          </p>
        </div>

      </div>
    </footer>
  );
}
