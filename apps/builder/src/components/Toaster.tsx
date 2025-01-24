import { useColorMode, useColorModeValue, useToken } from "@chakra-ui/react";
import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => {
  const { colorMode } = useColorMode();
  const theme = useColorModeValue(
    {
      bg: undefined,
      actionBg: "var(--chakra-colors-orange-500)",
      actionColor: undefined,
    },
    {
      bg: "var(--chakra-colors-gray-900)",
      actionBg: "var(--chakra-colors-orange-400)",
      actionColor: "white",
    },
  );
  return (
    <SonnerToaster
      theme={colorMode}
      toastOptions={{
        actionButtonStyle: {
          backgroundColor: theme.actionBg,
          color: theme.actionColor,
        },
        style: {
          backgroundColor: theme.bg,
        },
      }}
    />
  );
};
