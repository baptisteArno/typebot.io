import twTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import twAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
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
        heading: ["var(--font-uxum-grotesque)"],
        body: ["var(--font-untitled-sans)"],
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        ["slide-fade-in"]: "slide-fade-in 250ms ease-out",
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
      },
    },
  },
  plugins: [twAnimate, twTypography],
} satisfies Config;

function getColorScale(name: string) {
  const scale: Record<string, string> = {};
  for (let i = 1; i <= 12; i++) {
    scale[i] = `rgb(var(--${name}-${i}))`;
  }
  return scale;
}
