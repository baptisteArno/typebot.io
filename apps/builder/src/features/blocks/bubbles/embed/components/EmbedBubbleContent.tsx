import { useTranslate } from "@tolgee/react";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  block: EmbedBubbleBlock;
};

export const EmbedBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  if (!block.content?.url) return <p color="gray.500">{t("clickToEdit")}</p>;
  return (
    <div className="flex flex-col gap-2">
      <p>{t("editor.blocks.bubbles.embed.node.show.text")}</p>
      {typebot &&
        block.content.waitForEvent?.isEnabled &&
        block.content.waitForEvent.saveDataInVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={block.content.waitForEvent.saveDataInVariableId}
          />
        )}
    </div>
  );
};
