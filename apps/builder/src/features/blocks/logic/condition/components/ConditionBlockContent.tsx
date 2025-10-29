import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";

export const ConditionBlockContent = ({
  block,
  indices,
}: {
  block: ConditionBlock;
  indices: BlockIndices;
}) => (
  <div className="flex flex-col gap-2 w-[90%]">
    <ItemNodesList block={block} indices={indices} />
  </div>
);
