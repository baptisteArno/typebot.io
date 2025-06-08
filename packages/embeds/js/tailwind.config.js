import defaultTheme from "tailwindcss/defaultTheme";
import { chatContainerBreakpoints } from "./src/constants";

function rem2px(input, fontSize = 16) {
  if (input == null) {
    return input;
  }
  switch (typeof input) {
    case "object":
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      }
      const ret = {};
      for (const key in input) {
        ret[key] = rem2px(input[key], fontSize);
      }
      return ret;
    case "string":
      return input.replace(
        /(\d*\.?\d+)rem$/,
        (_, val) => `${Number.parseFloat(val) * fontSize}px`,
      );
    case "function":
      return eval(
        input
          .toString()
          .replace(
            /(\d*\.?\d+)rem/g,
            (_, val) => `${Number.parseFloat(val) * fontSize}px`,
          ),
      );
    default:
      return input;
  }
}

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    ...rem2px(defaultTheme),
    colors: {
      black: "rgb(0, 0, 0)",
      white: "rgb(255, 255, 255)",
      transparent: "transparent",
      inherit: "inherit",
      "button-text": "var(--typebot-button-color)",
      "button-bg":
        "rgba(var(--typebot-button-bg-rgb), var(--typebot-button-opacity));",
      "button-border":
        "rgba(var(--typebot-button-border-rgb), var(--typebot-button-border-opacity));",
      "host-bubble-text": "var(--typebot-host-bubble-color)",
      "host-bubble-bg":
        "rgba(var(--typebot-host-bubble-bg-rgb), var(--typebot-host-bubble-opacity));",
      "host-bubble-border":
        "rgba(var(--typebot-host-bubble-border-rgb), var(--typebot-host-bubble-border-opacity));",
      "input-border":
        "rgba(var(--typebot-input-border-rgb), var(--typebot-input-border-opacity));",
      "input-text": "var(--typebot-input-color)",
      "input-bg":
        "rgba(var(--typebot-input-bg-rgb), var(--typebot-input-opacity));",
    },
    containers: {
      xs: `${chatContainerBreakpoints.xs}px`,
    },
    extend: {
      maxWidth: {
        "chat-container": "var(--typebot-chat-container-max-width)",
      },
      maxHeight: {
        "chat-container": "var(--typebot-chat-container-max-height)",
      },
      minHeight: {
        "chat-container": "var(--typebot-chat-container-max-height)",
      },
      blur: {
        button: "var(--typebot-button-blur)",
        "host-bubble": "var(--typebot-host-bubble-blur)",
      },
      boxShadow: {
        button: "var(--typebot-button-box-shadow)",
        "host-bubble": "var(--typebot-host-bubble-box-shadow)",
        input: "var(--typebot-input-box-shadow)",
      },
      borderRadius: {
        chat: "var(--typebot-chat-container-border-radius)",
        button: "var(--typebot-button-border-radius)",
        "host-bubble": "var(--typebot-host-bubble-border-radius)",
        "chat-container": "var(--typebot-chat-container-border-radius)",
      },
      borderWidth: {
        button: "var(--typebot-button-border-width)",
        "host-bubble": "var(--typebot-host-bubble-border-width)",
        input: "var(--typebot-input-border-width)",
      },
      keyframes: {
        fadeInFromBottom: {
          "0%": {
            opacity: "0",
            transform: "translateY(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeOutFromBottom: {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(4px)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-from-bottom": "fadeInFromBottom 150ms ease-out forwards",
        "fade-out-from-bottom": "fadeOutFromBottom 50ms ease-out forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};

export default config;
