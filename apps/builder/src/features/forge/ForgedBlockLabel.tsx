import { Text, type TextProps } from "@chakra-ui/react";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockLabel = ({
  type,
  ...props
}: { type: ForgedBlock["type"] } & TextProps) => {
  const { blockDef } = useForgedBlock(type);

  return (
    <Text fontSize="sm" {...props}>
      {blockDef?.name}
    </Text>
  );
};
