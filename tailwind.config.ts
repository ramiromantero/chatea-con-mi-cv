import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grafito: "#0B0E14",
        panel: "#111623",
        "panel-2": "#161d2e",
        borde: "#232c42",
        acento: "#8b7cf6",
        "acento-2": "#6366f1",
        tinta: "#e2e6f0",
        "tinta-suave": "#8b93a7",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.35s ease-out both",
        "dot-bounce": "dotBounce 1.2s ease-in-out infinite",
        "glow-pulse": "glowPulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
