import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/utils/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prayas: {
          crimson: "#DC2626",
          darkred: "#991B1B",
          lightred: "#FEE2E2",
          emerald: "#059669",
          navy: "#0F172A",
          slate: "#1E293B",
          amber: "#D97706",
          accent: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(220, 38, 38, 0.3)",
        "glow-emerald": "0 0 25px -5px rgba(5, 150, 105, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
