import { Stack, Text, Wrap } from "@chakra-ui/react";
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
    <Stack w="90%">
      {block.options?.dynamicVariableId ? (
        <Wrap spacing={1}>
          <Text>{t("blocks.inputs.button.variables.display.label")}</Text>
          <Badge colorScheme="purple">{dynamicVariableName}</Badge>
          <Text>{t("blocks.inputs.button.variables.buttons.label")}</Text>
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
