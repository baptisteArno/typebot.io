import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import { useMemo } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: JumpBlock["options"];
};

export const JumpNodeBody = ({ options }: Props) => {
  const { typebot } = useTypebot();

  const { groupTitle, blockIndex } = useMemo(() => {
    if (!options?.groupId) return {};
    if (isSingleVariable(options.groupId))
      return {
        groupTitle: options.groupId,
      };
    const group = typebot?.groups.find(byId(options.groupId));
    if (!group) return {};
    const blockIndex = group.blocks.findIndex(byId(options.blockId));
    return {
      groupTitle: group.title,
      blockIndex: blockIndex >= 0 ? blockIndex + 1 : undefined,
    };
  }, [options?.groupId, options?.blockId, typebot?.groups]);

  if (!groupTitle) return <p color="gray.500">Configure...</p>;
  return (
    <p>
      Jump to <Badge colorScheme="purple">{groupTitle}</Badge>{" "}
      {isDefined(blockIndex) && blockIndex >= 0 ? (
        <>
          at block <Badge colorScheme="purple">{blockIndex + 1}</Badge>
        </>
      ) : null}
    </p>
  );
};
