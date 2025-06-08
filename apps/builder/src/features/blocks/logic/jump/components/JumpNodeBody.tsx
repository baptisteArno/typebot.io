import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Tag, Text } from "@chakra-ui/react";
import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import React, { useMemo } from "react";

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

  if (!groupTitle) return <Text color="gray.500">Configure...</Text>;
  return (
    <Text>
      Jump to <Tag colorScheme="purple">{groupTitle}</Tag>{" "}
      {isDefined(blockIndex) && blockIndex >= 0 ? (
        <>
          at block <Tag colorScheme="purple">{blockIndex + 1}</Tag>
        </>
      ) : null}
    </Text>
  );
};
