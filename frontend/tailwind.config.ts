import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── Stitch Dark Mode Design Tokens ── */
        surface: {
          DEFAULT: "#0d141d",
          dim: "#0d141d",
          bright: "#333a44",
          container: {
            DEFAULT: "#192029",
            low: "#151c25",
            high: "#232a34",
            highest: "#2e353f",
            lowest: "#080f17"
          }
        },
        "on-surface": {
          DEFAULT: "#dce3f0",
          variant: "#c3c6d7"
        },
        primary: {
          DEFAULT: "#b4c5ff",
          container: "#2563eb",
          fixed: "#dbe1ff",
          "fixed-dim": "#b4c5ff"
        },
        "on-primary": {
          DEFAULT: "#002a78",
          container: "#eeefff",
          fixed: "#00174b",
          "fixed-variant": "#003ea8"
        },
        "inverse-primary": "#0053db",
        "inverse-surface": "#dce3f0",
        "inverse-on-surface": "#2a313b",
        secondary: {
          DEFAULT: "#c8c6c5",
          container: "#4a4949",
          fixed: "#e5e2e1",
          "fixed-dim": "#c8c6c5"
        },
        "on-secondary": {
          DEFAULT: "#313030",
          container: "#bab8b7",
          fixed: "#1c1b1b",
          "fixed-variant": "#474646"
        },
        tertiary: {
          DEFAULT: "#c9c6c5",
          container: "#6e6d6d",
          fixed: "#e5e2e1",
          "fixed-dim": "#c9c6c5"
        },
        "on-tertiary": {
          DEFAULT: "#313030",
          container: "#f3f0ef",
          fixed: "#1c1b1b",
          "fixed-variant": "#474646"
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a"
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6"
        },
        outline: {
          DEFAULT: "#8d90a0",
          variant: "#434655"
        },
        "surface-tint": "#b4c5ff",
        background: "#0d141d",
        "on-background": "#dce3f0",

        /* ── Functional status colors ── */
        status: {
          critical: "#dc2626",
          warning: "#d97706",
          safe: "#16a34a",
          info: "#2563eb"
        }
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        "2xl": "64px",
        xxl: "96px",
        margin: "48px",
        gutter: "24px"
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "600" }],
        "display-lg-mobile": ["40px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "500" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "500" }],
        "mono-data": ["14px", { lineHeight: "20px", letterSpacing: "-0.01em", fontWeight: "400" }]
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
