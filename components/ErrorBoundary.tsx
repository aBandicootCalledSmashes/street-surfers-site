"use client";

/**
 * ST·SURFERS — ERROR BOUNDARY
 * ─────────────────────────────────────────────────────────────────────────────
 * Catches React render errors so one broken section never takes down the page.
 * Must be a class component — React's error boundary API requires it.
 *
 * Usage:
 *   <ErrorBoundary label="Ride Section">
 *     <RideSection ... />
 *   </ErrorBoundary>
 *
 * Or with a fully custom fallback:
 *   <ErrorBoundary fallback={<MyCustomFallback />}>
 *     ...
 *   </ErrorBoundary>
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";

interface Props {
  children: React.ReactNode;
  /** Short label shown in the fallback card — e.g. "Price Estimator" */
  label?: string;
  /** Completely custom fallback UI (overrides the default card) */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log in development — replace with a real error service (Sentry etc.) post-launch
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", this.props.label ?? "Section", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Custom fallback wins
    if (this.props.fallback) return this.props.fallback;

    // ── Default brand-styled fallback ─────────────────────────────────────────
    return (
      <div className="section-py bg-ss-black">
        <div className="container-site">
          <div
            className="rounded-2xl p-8 max-w-lg mx-auto text-center"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(208,28,0,0.3)",
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(208,28,0,0.12)" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#D01C00" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <p className="font-display font-bold text-white text-lg mb-2">
              {this.props.label
                ? `${this.props.label} hit a snag`
                : "Something went sideways"}
            </p>
            <p className="text-sm font-body mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              No stress — reload this section or try again in a moment.
            </p>

            {/* Dev-only error detail */}
            {process.env.NODE_ENV !== "production" && this.state.errorMessage && (
              <pre
                className="text-left text-xs rounded-lg p-3 mb-5 overflow-auto max-h-32 font-mono"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "#D01C00",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {this.state.errorMessage}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="px-6 py-3 rounded-xl text-sm font-display font-bold text-white uppercase tracking-widest"
              style={{ backgroundColor: "#D01C00" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
