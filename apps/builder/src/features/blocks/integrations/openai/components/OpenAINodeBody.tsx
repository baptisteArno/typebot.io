import type { OpenAIBlock } from "@typebot.io/blocks-integrations/openai/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options: OpenAIBlock["options"];
};

export const OpenAINodeBody = ({ options }: Props) => {
  const { typebot } = useTypebot();
  const responseMappings =
    options && "responseMapping" in options
      ? (options.responseMapping ?? [])
      : [];

  return (
    <div className="flex flex-col gap-2">
      <p
        className={cx(
          "truncate",
          options?.task ? "text-gray-12" : "text-gray-9",
        )}
      >
        {options?.task ?? "Configure..."}
      </p>
      {typebot &&
        options &&
        "responseMapping" in options &&
        responseMappings
          .filter((mapping) => mapping.variableId)
          .map((mapping) => (
            <SetVariableLabel
              key={mapping.id}
              variables={typebot.variables}
              variableId={mapping.variableId!}
            />
          ))}
      {typebot &&
        options &&
        "saveUrlInVariableId" in options &&
        options.saveUrlInVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={options.saveUrlInVariableId}
          />
        )}
    </div>
  );
};
