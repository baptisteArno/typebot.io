import defaultTheme from "tailwindcss/defaultTheme";

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
    },
    extend: {
      blur: {
        button: "var(--typebot-button-blur)",
      },
      boxShadow: {
        button: "var(--typebot-button-box-shadow)",
      },
      borderRadius: {
        button: "var(--typebot-button-border-radius)",
        "host-bubble": "var(--typebot-host-bubble-border-radius)",
      },
      borderWidth: {
        button: "var(--typebot-button-border-width)",
        "host-bubble": "var(--typebot-host-bubble-border-width)",
      },
      keyframes: {
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
      },
    },
  },
  plugins: [],
};

export default config;
