import type { Config } from "tailwindcss";

// Same "Thermal" design system used in the original static site,
// just expressed as Tailwind theme tokens instead of CSS variables read at runtime.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14171C",
        surface: "#1E232B",
        surface2: "#20262f",
        line: "#2C333D",
        text: "#F5F3EF",
        muted: "#9AA3AE",
        accent: "#FF6B35", // heat glow
        accent2: "#4FD1C5", // vibration / cool contrast
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
