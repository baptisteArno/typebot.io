import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";

type Props = {
  block: EmbedBubbleBlock;
};

export const EmbedBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  if (!block.content?.url)
    return <Text color="gray.500">{t("clickToEdit")}</Text>;
  return (
    <Stack>
      <Text>{t("editor.blocks.bubbles.embed.node.show.text")}</Text>
      {typebot &&
        block.content.waitForEvent?.isEnabled &&
        block.content.waitForEvent.saveDataInVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={block.content.waitForEvent.saveDataInVariableId}
          />
        )}
    </Stack>
  );
};
