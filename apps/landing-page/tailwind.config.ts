import twTypography from "@tailwindcss/typography";
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
    },
    extend: {
      fontFamily: {
        heading: ["Uxum Grotesque", "sans-serif"],
        body: ["Untitled Sans", "sans-serif"],
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        "slide-fade-in": "slide-fade-in 250ms ease-out",
        float: "float 4s ease-in-out infinite",
        "slight-random-rotate": "linear slight-random-rotate forwards",
        "fade-in": "fade-in 250ms ease-out",
        "fade-out": "fade-out 250ms ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - 2rem))" },
        },
        ["slide-fade-in"]: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "slight-random-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(var(--rotate-angle))" },
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
  plugins: [twTypography],
} satisfies Config;

function getColorScale(name: string) {
  const scale: Record<string, string> = {};
  for (let i = 1; i <= 12; i++) {
    scale[i] = `rgb(var(--${name}-${i}))`;
  }
  return scale;
}
