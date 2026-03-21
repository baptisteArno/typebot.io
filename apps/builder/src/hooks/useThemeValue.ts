import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useThemeValue = <T>(light: T, dark: T): T => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return light;
  return resolvedTheme === "dark" ? dark : light;
};
