import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { EventIcon } from "@/features/events/components/EventIcon";

type Props = {
  options: ReplyEvent["options"];
};

export const ReplyEventNode = ({ options }: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();

  return (
    <div className="flex flex-1 items-start gap-3 font-normal">
      <EventIcon type={EventType.REPLY} className="mt-1" />
      <div className="flex flex-col gap-2">
        <p>{t("blocks.events.reply.node.prefix")}</p>
        {options?.contentVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.contentVariableId}
          />
        ) : null}
        {options?.inputTypeVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.inputTypeVariableId}
          />
        ) : null}
        {options?.inputNameVariableId ? (
          <SetVariableLabel
            variables={typebot?.variables}
            variableId={options.inputNameVariableId}
          />
        ) : null}
      </div>
    </div>
  );
};
