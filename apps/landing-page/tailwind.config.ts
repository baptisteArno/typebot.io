import type { Config } from "tailwindcss";
import sharedConfig from "../../packages/ui/tailwind.config";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [sharedConfig],
  theme: {
    supports: {
      scrollanimation: "animation-timeline: scroll()",
    },
    extend: {
      animation: {
        marquee: "marquee 15s linear infinite",
        // Scroll animations
        "slight-random-rotate": "linear slight-random-rotate forwards",
        "fill-carousel-dot": "linear fill-carousel-dot forwards",
        "fade-in": "linear fade-in forwards",
        "fade-out": "linear fade-out forwards",
        "magic-zoom": "linear magic-zoom forwards",
        "magic-zoom-blur": "linear magic-zoom-blur forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - var(--marquee-gap)))" },
        },
        "slight-random-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(var(--rotate-angle))" },
        },
        "magic-zoom-blur": {
          "0%": { filter: "blur(64px)" },
          "95%": { filter: "blur(64px)" },
          "100%": { filter: "blur(0px)" },
        },
        "fill-carousel-dot": {
          to: {
            "background-color": "rgb(var(--gray-10))",
          },
        },
        "magic-zoom": {
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
