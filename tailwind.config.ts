import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#070A0F", // Deepest background
          900: "#0B1017", // Primary surface
          850: "#101722", // Card / Panel background
          800: "#172131", // Elevated container
          700: "#223147", // Hover state
          600: "#324663", // Interactive border
        },
        brand: {
          green: "#10B981", // Pitch Green / Live indicator / Primary CTA
          "green-hover": "#059669",
          red: "#EF4444", // Broadcast Alert / Live Flash
          gold: "#F59E0B", // Expert Tier / Trophies
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
