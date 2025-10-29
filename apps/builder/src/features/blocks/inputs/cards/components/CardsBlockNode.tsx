import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";

type Props = {
  block: CardsBlock;
  indices: BlockIndices;
};

export const CardsBlockNode = ({ block, indices }: Props) => {
  const { typebot } = useTypebot();
  const savingVariableIds = block.options?.saveResponseMapping
    ?.map((mapping) => mapping?.variableId)
    .filter(isDefined);

  return (
    <div className="flex flex-col gap-2 w-[90%]">
      <ItemNodesList block={block} indices={indices} />
      {savingVariableIds?.map((variableId) => (
        <SetVariableLabel
          key={variableId}
          variableId={variableId}
          variables={typebot?.variables}
        />
      ))}
    </div>
  );
};
