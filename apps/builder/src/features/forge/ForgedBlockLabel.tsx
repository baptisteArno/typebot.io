import type { BlockDefinition } from "@typebot.io/forge/types";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Badge } from "@typebot.io/ui/components/Badge";
import { cn } from "@typebot.io/ui/lib/cn";
import { useForgedBlock } from "./hooks/useForgedBlock";

export const ForgedBlockLabel = ({
  type,
  className,
}: {
  type: ForgedBlock["type"];
  className?: string;
}) => {
  const { blockDef } = useForgedBlock({ nodeType: type });

  return (
    <p className={cn("text-sm", className)}>
      {blockDef?.name}
      <ForgeBlockBadge badge={blockDef?.badge} className="ml-1" />
    </p>
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
