import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";
import { Stack } from "@chakra-ui/react";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";

export const ConditionBlockContent = ({
  block,
  indices,
}: {
  block: ConditionBlock;
  indices: BlockIndices;
}) => (
  <Stack w="90%">
    <ItemNodesList block={block} indices={indices} />
  </Stack>
);
