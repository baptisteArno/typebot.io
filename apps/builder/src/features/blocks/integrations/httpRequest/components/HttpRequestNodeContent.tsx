import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  block: HttpRequestBlock;
};

export const HttpRequestNodeContent = ({ block: { options } }: Props) => {
  const { typebot } = useTypebot();
  const webhook = options?.webhook;

  if (!webhook?.url) return <p className="text-gray-9">Configure...</p>;
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="pr-6 text-gray-9 truncate">
        {webhook.method} {webhook.url}
      </p>
      {options?.responseVariableMapping
        ?.filter((mapping) => mapping.variableId)
        .map((mapping) => (
          <SetVariableLabel
            key={mapping.variableId}
            variableId={mapping.variableId as string}
            variables={typebot?.variables}
          />
        ))}
    </div>
  );
};
