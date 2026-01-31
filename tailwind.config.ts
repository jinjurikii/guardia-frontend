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
        studio: {
          bg: "#0f0f0f",      // Deep workspace background
          card: "#1e1e1e",    // Content cards
          border: "#2e2e2e",  // Subtle dividers
          accent: "#3b82f6",  // The "Friend" blue
          text: "#f5f5f5",    // Primary text
          muted: "#a1a1aa",   // Secondary text
        },
      },
    },
  },
  plugins: [],
};
export default config;
