import { useTranslate } from "@tolgee/react";
import type { AudioBubbleBlock } from "@typebot.io/blocks-bubbles/audio/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  url: NonNullable<AudioBubbleBlock["content"]>["url"];
};

export const AudioBubbleNode = ({ url }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  const variable = typebot ? findUniqueVariable(typebot?.variables)(url) : null;
  return isDefined(url) ? (
    variable ? (
      <p>
        Play <VariableTag variableName={variable.name} />
      </p>
    ) : (
      <audio
        src={url}
        controls
        className="rounded-md max-w-[calc(100% - 25px)]"
      />
    )
  ) : (
    <p color={"gray.500"}>{t("clickToEdit")}</p>
  );
};
