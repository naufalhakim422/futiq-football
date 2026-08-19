import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "var(--pitch-950)", // Deepest background
          900: "var(--pitch-900)", // Primary card / surface
          850: "var(--pitch-850)", // Sub-panel / Pill background
          800: "var(--pitch-800)", // Clean container border
          750: "var(--pitch-750)", // Divider / Interactive border
          700: "var(--pitch-700)", // Hover state
          600: "var(--pitch-600)", // Subtle border
        },
        brand: {
          green: "var(--brand-green)", // Pitch Green / Primary CTA
          "green-hover": "var(--brand-green-hover)",
          red: "var(--brand-red)", // Broadcast Alert
          gold: "var(--brand-gold)", // Expert Tier
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        editorial: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
