import type { WebhookBlock } from "@typebot.io/blocks-logic/webhook/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: WebhookBlock["options"];
};

export const WebhookNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot();
  return (
    <div className="flex flex-col gap-2">
      <p className="truncate">Listen for webhook</p>
      {typebot &&
        options?.responseVariableMapping
          ?.filter((mapping) => isDefined(mapping.variableId))
          .map((mapping, idx) => (
            <SetVariableLabel
              key={mapping.variableId! + idx}
              variables={typebot.variables}
              variableId={mapping.variableId!}
            />
          ))}
    </div>
  );
};
