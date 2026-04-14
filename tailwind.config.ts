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
        navy: {
          950: "#010810",
          900: "#020c1b",
          800: "#040f22",
          700: "#061529",
          600: "#091c34",
          500: "#0d2442",
        },
        ocean: {
          700: "#0a1f3d",
          600: "#0e2a52",
          500: "#123368",
          400: "#1a4280",
        },
        brand: {
          900: "#1e3a5f",
          800: "#1a4a7a",
          700: "#1d5c96",
          600: "#2563eb",
          500: "#3b82f6",
          400: "#60a5fa",
          300: "#93c5fd",
          200: "#bfdbfe",
          100: "#dbeafe",
          50:  "#eff6ff",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(circle, rgba(59,130,246,0.15) 1px, transparent 1px)",
        "glow-radial": "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.3) 0%, transparent 65%)",
      },
      backgroundSize: {
        "dot-lg": "32px 32px",
      },
      boxShadow: {
        "blue-glow": "0 0 20px rgba(59,130,246,0.25)",
        "blue-glow-sm": "0 0 8px rgba(59,130,246,0.3)",
        "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        "fade-up":    "fadeUp 0.4s ease-out forwards",
        "fade-in":    "fadeIn 0.3s ease-out forwards",
        "slide-left": "slideLeft 0.3s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(59,130,246,0.2)" },
          "50%":       { boxShadow: "0 0 20px rgba(59,130,246,0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
