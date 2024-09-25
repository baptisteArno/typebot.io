import { type IconProps, useColorMode } from "@chakra-ui/react";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockIcon = ({
  type,
  ...props
}: {
  type: ForgedBlock["type"];
} & IconProps): JSX.Element => {
  const { colorMode } = useColorMode();
  const { blockDef } = useForgedBlock(type);
  if (!blockDef) return <></>;
  if (colorMode === "dark" && blockDef.DarkLogo)
    return (
      <blockDef.DarkLogo
        width="1rem"
        style={{ marginTop: props.mt?.toString() }}
      />
    );
  return (
    <blockDef.LightLogo
      width="1rem"
      style={{ marginTop: props.mt?.toString() }}
    />
  );
};
