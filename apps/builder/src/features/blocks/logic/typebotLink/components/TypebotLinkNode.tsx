import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/queryClient";
import { Tag, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { byId, isNotEmpty } from "@typebot.io/lib/utils";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import React, { useMemo } from "react";

type Props = {
  block: TypebotLinkBlock;
};

export const TypebotLinkNode = ({ block }: Props) => {
  const { typebot } = useTypebot();

  const { data: linkedTypebotData } = useQuery(
    trpc.typebot.getTypebot.queryOptions(
      {
        typebotId: block.options?.typebotId as string,
      },
      {
        enabled:
          isNotEmpty(block.options?.typebotId) &&
          block.options?.typebotId !== "current",
      },
    ),
  );

  const isCurrentTypebot =
    typebot &&
    (block.options?.typebotId === typebot.id ||
      block.options?.typebotId === "current");
  const linkedTypebot = isCurrentTypebot ? typebot : linkedTypebotData?.typebot;

  const groupTitle = useMemo(() => {
    if (!block.options?.groupId) return;
    if (isSingleVariable(block.options.groupId)) return block.options.groupId;
    return linkedTypebot?.groups.find(byId(block.options.groupId))?.title;
  }, [block.options?.groupId, linkedTypebot?.groups]);

  if (!block.options?.typebotId)
    return <Text color="gray.500">Configure...</Text>;
  return (
    <Text>
      Jump{" "}
      {groupTitle ? (
        <>
          to <Tag colorScheme="purple">{groupTitle}</Tag>
        </>
      ) : (
        <></>
      )}{" "}
      {!isCurrentTypebot ? (
        <>
          in <Tag>{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  );
};
