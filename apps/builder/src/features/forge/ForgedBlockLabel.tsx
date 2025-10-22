import { Text, type TextProps } from "@chakra-ui/react";
import type { BlockDefinition } from "@typebot.io/forge/types";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Badge } from "@typebot.io/ui/components/Badge";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockLabel = ({
  type,
  className,
}: { type: ForgedBlock["type"] } & TextProps) => {
  const { blockDef } = useForgedBlock({ nodeType: type });

  return (
    <Text fontSize="sm" className={className}>
      {blockDef?.name}
      <ForgeBlockBadge badge={blockDef?.badge} className="ml-1" />
    </Text>
  );
};

const ForgeBlockBadge = ({
  badge,
  className,
}: {
  badge: BlockDefinition<any, any, any>["badge"];
  className?: string;
}) => {
  if (badge === "beta") {
    return (
      <Badge colorScheme="orange" className={className}>
        Beta
      </Badge>
    );
  }
  return null;
};
