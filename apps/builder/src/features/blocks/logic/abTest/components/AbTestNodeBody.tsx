import { BlockSourceEndpoint } from "@/features/graph/components/endpoints/BlockSourceEndpoint";
import { Flex, Stack, Tag, Text, useColorModeValue } from "@chakra-ui/react";
import { defaultAbTestOptions } from "@typebot.io/blocks-logic/abTest/constants";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import React from "react";

type Props = {
  block: AbTestBlock;
  groupId: string;
};

export const AbTestNodeBody = ({ block, groupId }: Props) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bg = useColorModeValue("white", undefined);

  return (
    <Stack spacing={2} w="full">
      <Flex
        pos="relative"
        align="center"
        shadow="sm"
        rounded="md"
        bg={bg}
        borderWidth={"1px"}
        borderColor={borderColor}
        w="full"
      >
        <Text p="3">
          A{" "}
          <Tag>{block.options?.aPercent ?? defaultAbTestOptions.aPercent}%</Tag>
        </Text>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[0].id,
          }}
          groupId={groupId}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Flex>
      <Flex
        pos="relative"
        align="center"
        shadow="sm"
        rounded="md"
        bg={bg}
        borderWidth={"1px"}
        borderColor={borderColor}
        w="full"
      >
        <Text p="3">
          B{" "}
          <Tag>
            {100 - (block.options?.aPercent ?? defaultAbTestOptions.aPercent)}%
          </Tag>
        </Text>
        <BlockSourceEndpoint
          source={{
            blockId: block.id,
            itemId: block.items[1].id,
          }}
          groupId={groupId}
          pos="absolute"
          right="-49px"
          pointerEvents="all"
        />
      </Flex>
    </Stack>
  );
};
