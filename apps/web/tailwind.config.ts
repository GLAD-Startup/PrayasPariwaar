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
      screens: {
        xs: "480px",
        "2xl": "1536px",
        "3xl": "1920px",
      },
      colors: {
        prayas: {
          paper: "#F7F5F0",       // Primary surface / Vrindavan sandstone
          stone: "#EFECE6",       // Subtle container / card surface
          subtle: "#E7E2D8",      // Hover background
          rule: "#E2DDD5",        // Border / ledger divider rule
          ink: "#1C2421",         // Primary typography (high-contrast deep slate)
          muted: "#596560",       // Secondary text / metadata
          crimson: "#B91C1C",     // Clinical emergency blood red
          crimsonBg: "#FEF2F2",   // Blood alert background
          crimsonBorder: "#FECACA",
          neem: "#2E5339",        // Environmental foliage / neem green
          neemBg: "#F0FDF4",      // Green badge background
          neemBorder: "#BBF7D0",
          marigold: "#C87D20",    // Traditional seva ochre / recognition
          marigoldBg: "#FFFBEB",  // Ochre badge background
          marigoldBorder: "#FDE68A",
        },
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["'Source Sans 3'", "'Source Sans Pro'", "system-ui", "sans-serif"],
        display: ["Lora", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(28, 36, 33, 0.05), 0 1px 2px -1px rgba(28, 36, 33, 0.05)",
        card: "0 2px 6px 0 rgba(28, 36, 33, 0.06), 0 1px 3px 0 rgba(28, 36, 33, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
