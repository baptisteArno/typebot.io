import { useTranslate } from "@tolgee/react";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { Badge } from "@typebot.io/ui/components/Badge";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";

type Props = {
  block: PictureChoiceBlock;
  indices: BlockIndices;
};

export const PictureChoiceNode = ({ block, indices }: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const dynamicVariableName = typebot?.variables.find(
    (variable) =>
      variable.id === block.options?.dynamicItems?.pictureSrcsVariableId,
  )?.name;

  return (
    <div className="flex flex-col gap-2 w-[90%]">
      {block.options?.dynamicItems?.isEnabled && dynamicVariableName ? (
        <div className="flex flex-wrap gap-1">
          <p>
            {t("blocks.inputs.picture.settings.dynamicVariables.display.label")}
          </p>
          <Badge colorScheme="purple">{dynamicVariableName}</Badge>
          <p>
            {t(
              "blocks.inputs.picture.settings.dynamicVariables.pictures.label",
            )}
          </p>
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
