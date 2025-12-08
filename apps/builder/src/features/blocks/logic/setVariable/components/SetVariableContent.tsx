import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { byId } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import { cx } from "@typebot.io/ui/lib/cva";
import type { Variable } from "@typebot.io/variables/schemas";
import type { JSX } from "react";
import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { typebot } = useTypebot();
  const variableName =
    typebot?.variables.find(byId(block.options?.variableId))?.name ?? "";
  return (
    <p
      className={cx(
        "line-clamp-4",
        variableName === "" ? "text-gray-9" : "text-gray-12",
      )}
    >
      {variableName === "" ? (
        "Click to edit..."
      ) : (
        <Expression
          options={block.options}
          variables={typebot?.variables ?? []}
        />
      )}
    </p>
  );
};

const Expression = ({
  options,
  variables,
}: {
  options: SetVariableBlock["options"];
  variables: Variable[];
}): JSX.Element | null => {
  const variableName = variables.find(byId(options?.variableId))?.name ?? "";
  switch (options?.type) {
    case "Custom":
    case undefined:
      return (
        <div className="flex flex-col gap-2 max-h-[60vh]">
          <span>
            <CustomExpression
              variableName={variableName}
              expressionDescription={options?.expressionDescription}
              isCode={options?.isCode ?? false}
              expression={options?.expressionToEvaluate}
            />
          </span>
          {options?.saveErrorInVariableId && (
            <SetVariableLabel
              variables={variables}
              variableId={options?.saveErrorInVariableId}
            />
          )}
        </div>
      );
    case "Map item with same index": {
      const baseItemVariable = variables.find(
        byId(options.mapListItemParams?.baseItemVariableId),
      );
      const baseListVariable = variables.find(
        byId(options.mapListItemParams?.baseListVariableId),
      );
      const targetListVariable = variables.find(
        byId(options.mapListItemParams?.targetListVariableId),
      );
      return (
        <span>
          {variableName}= item in ${targetListVariable?.name}with same index as
          ${baseItemVariable?.name}in ${baseListVariable?.name}
        </span>
      );
    }
    case "Append value(s)": {
      return (
        <span>
          Append {options.item}in {variableName}
        </span>
      );
    }
    case "Empty":
      return <span>Reset {variableName} </span>;
    case "Shift":
    case "Pop": {
      const itemVariableName = variables.find(
        byId(options.saveItemInVariableId),
      )?.name;
      return (
        <span>
          {options.type} {variableName}
          {itemVariableName ? ` into ${itemVariableName}` : ""}
        </span>
      );
    }
    case "Random ID":
    case "Today":
    case "Now":
    case "Tomorrow":
    case "User ID":
    case "Result ID":
    case "Moment of the day":
    case "Environment name":
    case "Device type":
    case "Transcript":
    case "Yesterday": {
      return (
        <span>
          {variableName}={" "}
          <Badge colorScheme="purple">System.{options.type}</Badge>
        </span>
      );
    }
    case "Contact name":
    case "Phone number":
    case "Referral Click ID":
    case "Referral Source ID":
      return (
        <span>
          {variableName}={" "}
          <Badge colorScheme="purple">WhatsApp.{options.type}</Badge>
        </span>
      );
  }
};

const CustomExpression = ({
  expressionDescription,
  isCode,
  expression,
  variableName,
}: {
  expressionDescription?: string;
  isCode: boolean;
  expression?: string;
  variableName: string;
}) => {
  if (!expression) return null;
  if (expressionDescription)
    return (
      <span>
        {variableName}={" "}
        <Badge colorScheme="gray">{expressionDescription}</Badge>
      </span>
    );
  if (isCode)
    return (
      <div className="flex flex-col gap-1">
        <p>{variableName} =</p>
        <pre className="bg-gray-3 rounded-md p-2 line-clamp-6">
          {expression}
        </pre>
      </div>
    );
  return (
    <span className="truncate line-clamp-5">
      {variableName}= {expression}
    </span>
  );
};
