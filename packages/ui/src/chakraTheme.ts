import {
  accordionAnatomy,
  alertAnatomy,
  menuAnatomy,
  modalAnatomy,
  popoverAnatomy,
  switchAnatomy,
  tabsAnatomy,
} from "@chakra-ui/anatomy";
import {
  createMultiStyleConfigHelpers,
  defineStyleConfig,
  extendTheme,
  type StyleFunctionProps,
  type ThemeConfig,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
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

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const fonts = {
  heading: uxumGrotesque.style.fontFamily,
  body: untitledSans.style.fontFamily,
};

export const colors = {
  gray: {
    50: "#f8f8f8",
    100: "#f1f1f1",
    200: "#DFDFDF",
    300: "#bdbdbd",
    400: "#989898",
    500: "#7c7c7c",
    600: "#656565",
    700: "#525252",
    800: "#464646",
    900: "#1A1A1A",
    950: "#0D0D0D",
  },
  blue: {
    50: "#eef4ff",
    100: "#dae5ff",
    200: "#bdd2ff",
    300: "#90b6ff",
    400: "#598dff",
    500: "#3566fc",
    600: "#1f45f1",
    700: "#1730de",
    800: "#1929b4",
    900: "#1a288e",
    950: "#151b56",
  },
  orange: {
    50: "#fff4ed",
    100: "#ffe6d4",
    200: "#ffc8a8",
    300: "#ffa270",
    400: "#ff6f37",
    500: "#ff5924",
    600: "#f02f06",
    700: "#c71f07",
    800: "#9e1a0e",
    900: "#7f190f",
    950: "#450805",
  },
  purple: {
    50: "#f4f2ff",
    100: "#ebe8ff",
    200: "#dad4ff",
    300: "#beb2ff",
    400: "#a993ff",
    500: "#8055fd",
    600: "#7132f5",
    700: "#6220e1",
    800: "#521abd",
    900: "#45189a",
    950: "#280c69",
  },
  red: {
    50: "#fff1f2",
    100: "#ffe1e3",
    200: "#ffc7ca",
    300: "#ffa0a5",
    400: "#ff5861",
    500: "#f83b45",
    600: "#e51d28",
    700: "#c1141d",
    800: "#a0141c",
    900: "#84181e",
    950: "#48070b",
  },
};

const Modal = createMultiStyleConfigHelpers(
  modalAnatomy.keys,
).defineMultiStyleConfig({
  baseStyle: ({ colorMode }) => ({
    dialog: { bg: colorMode === "dark" ? "gray.900" : "white" },
  }),
});

const Popover = createMultiStyleConfigHelpers(
  popoverAnatomy.keys,
).defineMultiStyleConfig({
  baseStyle: ({ colorMode }) => ({
    popper: {
      width: "fit-content",
      maxWidth: "fit-content",
    },
    content: {
      bg: colorMode === "dark" ? "gray.900" : "white",
    },
  }),
});

const Menu = createMultiStyleConfigHelpers(
  menuAnatomy.keys,
).defineMultiStyleConfig({
  baseStyle: ({ colorMode }) => ({
    list: {
      shadow: "lg",
      bg: colorMode === "dark" ? "gray.900" : "white",
    },
    item: {
      bg: colorMode === "dark" ? "gray.900" : "white",
      _hover: {
        bg: colorMode === "dark" ? "gray.700" : "gray.100",
      },
    },
  }),
});

const Accordion = createMultiStyleConfigHelpers(
  accordionAnatomy.keys,
).defineMultiStyleConfig({
  baseStyle: ({ colorMode }) => ({
    container: {},
    button: {
      _hover: {
        bg: colorMode === "dark" ? "gray.800" : undefined,
      },
    },
  }),
});

const Button = defineStyleConfig({
  baseStyle: ({ colorMode }) => ({
    bg: colorMode === "dark" ? "gray.900" : "white",
    fontWeight: "medium",
  }),
  variants: {
    solid: ({ colorMode, colorScheme }) => {
      if (colorScheme === "gray") return {};
      if (colorScheme === "white")
        return {
          bg: colorMode === "dark" ? "gray.900" : "white",
          color: colorMode === "dark" ? "gray.50" : "gray.950",
          borderWidth: 1,
          _hover: {
            bg: colorMode === "dark" ? "gray.800" : "gray.50",
          },
          _active: {
            bg: colorMode === "dark" ? "gray.700" : "gray.100",
          },
        };
      return {
        bg: `${colorScheme}.500`,
        color: "white",
        _hover: {
          bg:
            colorMode === "dark" ? `${colorScheme}.400` : `${colorScheme}.600`,
        },
        _active: {
          bg:
            colorMode === "dark" ? `${colorScheme}.300` : `${colorScheme}.700`,
        },
      };
    },
    outline: {
      bg: "transparent",
    },
    ghost: {
      bg: "transparent",
    },
  },
});

const Alert = createMultiStyleConfigHelpers(
  alertAnatomy.keys,
).defineMultiStyleConfig({
  variants: {
    subtle: ({ colorScheme, colorMode }) => {
      if (colorScheme !== "blue" || colorMode === "dark") return {};
      return {
        container: {
          bg: "blue.50",
        },
      };
    },
  },
  baseStyle: {
    container: {
      borderRadius: "md",
    },
  },
});

const Switch = createMultiStyleConfigHelpers(
  switchAnatomy.keys,
).defineMultiStyleConfig({
  defaultProps: {
    colorScheme: "orange",
  },
  baseStyle: ({ colorMode, colorScheme }) => ({
    track: {
      _checked: {
        bg: colorMode === "dark" ? `${colorScheme}.400` : `${colorScheme}.500`,
      },
    },
  }),
});

const Tabs = createMultiStyleConfigHelpers(
  tabsAnatomy.keys,
).defineMultiStyleConfig({
  baseStyle: ({ colorMode }) => ({
    tablist: {
      gap: 2,
    },
    tab: {
      px: "3",
      borderRadius: "md",
      fontWeight: "semibold",
      _selected: {
        bg: colorMode === "dark" ? "gray.800" : "gray.100",
      },
      _hover: {
        bg: colorMode === "dark" ? "gray.800" : "gray.100",
      },
      _active: {
        bg: colorMode === "dark" ? "gray.700" : "gray.200",
      },
    },
    tabpanel: {
      px: 0,
    },
  }),
  defaultProps: {
    variant: "unstyled",
  },
});

const components = {
  Heading: {
    baseStyle: {
      fontWeight: "medium",
    },
  },
  Modal,
  Popover,
  Menu,
  Button,
  Accordion,
  Alert,
  Switch,
  Text: {},
  FormLabel: {
    baseStyle: {
      fontWeight: "regular",
    },
  },
  Spinner: {
    defaultProps: {
      colorScheme: "orange",
    },
  },
  NumberInput: {
    defaultProps: {
      focusBorderColor: "orange.300",
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: "orange.300",
    },
  },
  Textarea: {
    baseStyle: {
      focusBorderColor: "orange.300",
    },
  },
  Link: {
    baseStyle: {
      _hover: { textDecoration: "none" },
    },
  },
  Tooltip: {
    baseStyle: {
      rounded: "md",
    },
  },
  Tabs,
  Card: {
    baseStyle: {
      header: {
        pb: 0,
      },
      container: {
        color: "gray.950",
        shadow: "none",
        borderWidth: 1,
        borderColor: "gray.200",
        borderRadius: "2xl",
      },
    },
  },
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: mode("#F1F1F1", "gray.950")(props),
      color: mode("gray.950", "white")(props),
    },
  }),
};

export const customTheme = extendTheme({
  colors,
  fonts,
  components,
  config,
  styles,
  shadows: { outline: "0 0 0 2px var(--chakra-colors-orange-300)" },
});
