import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      gray: getColorScale("gray"),
      blue: getColorScale("blue"),
      orange: getColorScale("orange"),
      purple: getColorScale("purple"),
      red: getColorScale("red"),
      white: "rgb(255, 255, 255)",
      transparent: "transparent",
    },
    extend: {
      fontSize: {
        "4xl": ["2.5rem", "2.75rem"],
      },
      fontFamily: {
        heading: ["Uxum Grotesque", "sans-serif"],
        body: ["Untitled Sans", "sans-serif"],
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        "slight-random-rotate": "linear slight-random-rotate forwards",
        "scale-in": "linear scale-in forwards",
        // Needed for scroll based fade-in animation
        "fade-in": "fade-in 250ms ease-out",
        "fade-out": "fade-out 250ms ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - 2rem))" },
        },
        "slight-random-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(var(--rotate-angle))" },
        },
        "scale-in": {
          "0%": {
            transform: "scaleX(0) scaleY(0)",
          },
          "10%": {
            opacity: "1",
          },
          "70%": {
            transform: "scaleX(0.7) scaleY(0.5)",
          },
          "95%": {
            borderRadius: "1.5rem",
          },
          "100%": {
            transform: "scaleX(1) scaleY(1)",
            opacity: "1",
            borderRadius: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-motion")],
} satisfies Config;

function getColorScale(name: string) {
  const scale: Record<string, string> = {};
  for (let i = 1; i <= 12; i++) {
    scale[i] = `rgb(var(--${name}-${i}))`;
  }
  return scale;
}
