import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockIcon = ({
  type,
  className,
}: {
  type: ForgedBlock["type"];
  className?: string;
}): JSX.Element | null => {
  const { resolvedTheme } = useTheme();
  const { blockDef } = useForgedBlock({ nodeType: type });
  if (!blockDef) return null;
  if (resolvedTheme === "dark" && blockDef.DarkLogo)
    return <blockDef.DarkLogo width="1rem" className={className} />;
  return <blockDef.LightLogo width="1rem" className={className} />;
};
