import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  // Day-accent colours are applied dynamically (text-${color} etc.), so the
  // JIT scanner can't see them in source — safelist the full matrix here.
  safelist: [
    {
      pattern:
        /(bg|text|border|ring|from|to)-(figred|figorange|figyellow|figgreen|figteal|figblue|figpurple|figpink)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Figma rainbow — one hue per Config day
        figred: "#FF4D2E",
        figorange: "#FF8A00",
        figyellow: "#FFC700",
        figgreen: "#12C95A",
        figteal: "#00C4B4",
        figblue: "#18A0FB",
        figpurple: "#9747FF",
        figpink: "#FF53C2",
        ink: "#0B0B0F",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pop: "0 8px 0 0 rgba(11,11,15,1)",
        popsm: "0 4px 0 0 rgba(11,11,15,1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pop: "pop 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
