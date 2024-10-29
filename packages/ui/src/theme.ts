import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from "@chakra-ui/react";
import localFont from "next/font/local";

const untitledSans = localFont({
  src: [
    {
      path: "../assets/fonts/untitledSans/untitledSansRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/untitledSans/untitledSansRegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/untitledSans/untitledSansMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/untitledSans/untitledSansMediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/untitledSans/untitledSansBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/untitledSans/untitledSansBoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

const uxumGrotesque = localFont({
  src: [
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueRegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueMedium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueMediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueBold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/uxumGrotesque/uxumGrotesqueBoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
});

export const colors = {
  gray: {
    50: { value: "#f8f8f8" },
    100: { value: "#f1f1f1" },
    200: { value: "#DFDFDF" },
    300: { value: "#bdbdbd" },
    400: { value: "#989898" },
    500: { value: "#7c7c7c" },
    600: { value: "#656565" },
    700: { value: "#525252" },
    800: { value: "#464646" },
    900: { value: "#1A1A1A" },
    950: { value: "#0D0D0D" },
  },
  blue: {
    50: { value: "#eef4ff" },
    100: { value: "#dae5ff" },
    200: { value: "#bdd2ff" },
    300: { value: "#90b6ff" },
    400: { value: "#598dff" },
    500: { value: "#3566fc" },
    600: { value: "#1f45f1" },
    700: { value: "#1730de" },
    800: { value: "#1929b4" },
    900: { value: "#1a288e" },
    950: { value: "#151b56" },
  },
  orange: {
    50: { value: "#fff4ed" },
    100: { value: "#ffe6d4" },
    200: { value: "#ffc8a8" },
    300: { value: "#ffa270" },
    400: { value: "#ff6f37" },
    500: { value: "#ff5924" },
    600: { value: "#f02f06" },
    700: { value: "#c71f07" },
    800: { value: "#9e1a0e" },
    900: { value: "#7f190f" },
    950: { value: "#450805" },
  },
  purple: {
    50: { value: "#f4f2ff" },
    100: { value: "#ebe8ff" },
    200: { value: "#dad4ff" },
    300: { value: "#beb2ff" },
    400: { value: "#a993ff" },
    500: { value: "#8055fd" },
    600: { value: "#7132f5" },
    700: { value: "#6220e1" },
    800: { value: "#521abd" },
    900: { value: "#45189a" },
    950: { value: "#280c69" },
  },
  red: {
    50: { value: "#fff1f2" },
    100: { value: "#ffe1e3" },
    200: { value: "#ffc7ca" },
    300: { value: "#ffa0a5" },
    400: { value: "#ff5861" },
    500: { value: "#f83b45" },
    600: { value: "#e51d28" },
    700: { value: "#c1141d" },
    800: { value: "#a0141c" },
    900: { value: "#84181e" },
    950: { value: "#48070b" },
  },
};

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "lg",
  },
});

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      fonts: {
        heading: { value: uxumGrotesque.style.fontFamily },
        body: { value: untitledSans.style.fontFamily },
      },
      colors,
    },
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
