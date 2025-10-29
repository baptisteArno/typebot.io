import { useTranslate } from "@tolgee/react";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { Badge } from "@typebot.io/ui/components/Badge";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";

type Props = {
  block: ChoiceInputBlock;
  indices: BlockIndices;
};

export const ButtonsBlockNode = ({ block, indices }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  const dynamicVariableName = typebot?.variables.find(
    (variable) => variable.id === block.options?.dynamicVariableId,
  )?.name;

  return (
    <div className="flex flex-col gap-2 w-[90%]">
      {block.options?.dynamicVariableId ? (
        <div className="flex flex-wrap gap-1">
          <p>{t("blocks.inputs.button.variables.display.label")}</p>
          <Badge colorScheme="purple">{dynamicVariableName}</Badge>
          <p>{t("blocks.inputs.button.variables.buttons.label")}</p>
        </div>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {block.options?.variableId ? (
        <SetVariableLabel
          variableId={block.options.variableId}
          variables={typebot?.variables}
        />
      ) : null}
    </div>
  );
};
