import { Tag, type TagProps, Text, type TextProps } from "@chakra-ui/react";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import type { BlockDefinition } from "@typebot.io/forge/types";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockLabel = ({
  type,
  ...props
}: { type: ForgedBlock["type"] } & TextProps) => {
  const { blockDef } = useForgedBlock({ nodeType: type });

  return (
    <Text fontSize="sm" {...props}>
      {blockDef?.name}
      <ForgeBlockBadge badge={blockDef?.badge} ml={1} />
    </Text>
  );
};

const ForgeBlockBadge = ({
  badge,
  ...props
}: {
  badge: BlockDefinition<any, any, any>["badge"];
} & TagProps) => {
  if (badge === "beta") {
    return (
      <Tag colorScheme="orange" size="sm" {...props}>
        Beta
      </Tag>
    );
  }
  return null;
};
