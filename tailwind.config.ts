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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#111827",
          light: "#1f2937",
          purple: "#5D44FF",
          "purple-hover": "#5A37F5",
          soft: "#F8FAFC",
          line: "#E5E7EB",
          // legacy alias used in older UI accents
          accent: "#5D44FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(1rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.92)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "qr-scan-line": {
          "0%": { top: "6%", opacity: "0.35" },
          "50%": { opacity: "1" },
          "100%": { top: "90%", opacity: "0.35" },
        },
        "nav-progress": {
          "0%": { transform: "translateX(-100%) scaleX(0.35)" },
          "50%": { transform: "translateX(-20%) scaleX(0.55)" },
          "100%": { transform: "translateX(120%) scaleX(0.35)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "float-soft": "float-soft 5s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        "qr-scan-line": "qr-scan-line 1.5s ease-in-out infinite",
        "nav-progress": "nav-progress 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
