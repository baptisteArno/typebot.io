import { useTheme } from "next-themes";

export const useThemeValue = <T>(light: T, dark: T): T => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? dark : light;
};
