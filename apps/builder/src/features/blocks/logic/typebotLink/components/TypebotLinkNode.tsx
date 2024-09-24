import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/trpc";
import { Tag, Text } from "@chakra-ui/react";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { byId, isNotEmpty } from "@typebot.io/lib/utils";
import React from "react";

type Props = {
  block: TypebotLinkBlock;
};

export const TypebotLinkNode = ({ block }: Props) => {
  const { typebot } = useTypebot();

  const { data: linkedTypebotData } = trpc.typebot.getTypebot.useQuery(
    {
      typebotId: block.options?.typebotId as string,
    },
    {
      enabled:
        isNotEmpty(block.options?.typebotId) &&
        block.options?.typebotId !== "current",
    },
  );

  const isCurrentTypebot =
    typebot &&
    (block.options?.typebotId === typebot.id ||
      block.options?.typebotId === "current");
  const linkedTypebot = isCurrentTypebot ? typebot : linkedTypebotData?.typebot;
  const blockTitle = linkedTypebot?.groups.find(
    byId(block.options?.groupId),
  )?.title;

  if (!block.options?.typebotId)
    return <Text color="gray.500">Configure...</Text>;
  return (
    <Text>
      Jump{" "}
      {blockTitle ? (
        <>
          to <Tag>{blockTitle}</Tag>
        </>
      ) : (
        <></>
      )}{" "}
      {!isCurrentTypebot ? (
        <>
          in <Tag colorScheme="blue">{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  );
};
