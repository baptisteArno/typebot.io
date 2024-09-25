import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ItemNodesList } from "@/features/graph/components/nodes/item/ItemNodesList";
import { Stack, Tag, Text, Wrap } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { BlockIndices } from "@typebot.io/blocks-core/schemas/schema";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import React from "react";

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
    <Stack w="full">
      {block.options?.dynamicItems?.isEnabled && dynamicVariableName ? (
        <Wrap spacing={1}>
          <Text>
            {t("blocks.inputs.picture.settings.dynamicVariables.display.label")}
          </Text>
          <Tag bg="orange.400" color="white">
            {dynamicVariableName}
          </Tag>
          <Text>
            {t(
              "blocks.inputs.picture.settings.dynamicVariables.pictures.label",
            )}
          </Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {block.options?.variableId ? (
        <SetVariableLabel
          variableId={block.options.variableId}
          variables={typebot?.variables}
        />
      ) : null}
    </Stack>
  );
};
