import { GoogleSheetsAction } from "@typebot.io/blocks-integrations/googleSheets/constants";
import type { GoogleSheetsBlock } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

type Props = {
  options?: GoogleSheetsBlock["options"];
};

export const GoogleSheetsNodeContent = ({ options }: Props) => {
  const { typebot } = useTypebot();
  return (
    <div className="flex flex-col gap-2">
      <p
        className={cx(
          "truncate",
          options?.action ? "text-gray-12" : "text-gray-9",
        )}
      >
        {options?.action ?? "Configure..."}
      </p>
      {typebot &&
        options?.action === GoogleSheetsAction.GET &&
        options?.cellsToExtract
          ?.map((mapping) => mapping.variableId)
          .map((variableId, idx) =>
            variableId ? (
              <SetVariableLabel
                key={variableId + idx}
                variables={typebot.variables}
                variableId={variableId}
              />
            ) : null,
          )}
    </div>
  );
};
