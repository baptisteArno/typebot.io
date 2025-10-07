import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["src/**/*.{ts,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    colors: {
      gray: getColorScale("gray"),
      blue: getColorScale("blue"),
      orange: getColorScale("orange"),
      purple: getColorScale("purple"),
      red: getColorScale("red"),
      green: getColorScale("green"),
      white: "rgb(255, 255, 255)",
      transparent: "transparent",
      inherit: "inherit",
    },
    extend: {
      fontSize: {
        "4xl": ["2.5rem", "2.75rem"],
      },
      fontFamily: {
        heading: ["Uxum Grotesque", "sans-serif"],
        body: ["Untitled Sans", "sans-serif"],
        mono: [
          "JetBrainsMono",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontWeight: {
        inherit: "inherit",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

function getColorScale(name: string) {
  const scale: Record<string, string> = {};
  for (let i = 1; i <= 12; i++) {
    scale[i] = `rgb(var(--${name}-${i}))`;
  }
  return scale;
}
