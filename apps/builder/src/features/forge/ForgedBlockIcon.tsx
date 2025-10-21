import { useColorMode } from "@chakra-ui/react";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockIcon = ({
  type,
  className,
}: {
  type: ForgedBlock["type"];
  className?: string;
}): JSX.Element | null => {
  const { colorMode } = useColorMode();
  const { blockDef } = useForgedBlock({ nodeType: type });
  if (!blockDef) return null;
  if (colorMode === "dark" && blockDef.DarkLogo)
    return <blockDef.DarkLogo width="1rem" className={className} />;
  return <blockDef.LightLogo width="1rem" className={className} />;
};
