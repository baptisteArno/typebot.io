import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type {
  Variable,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { transformVariablesToList } from "@typebot.io/variables/transformVariablesToList";
import { filterChoiceItems } from "./filterChoiceItems";

export const injectVariableValuesInButtonsInputBlock = (
  block: ChoiceInputBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): ChoiceInputBlock => {
  if (block.options?.dynamicVariableId) {
    const variable = variables.find(
      (variable) =>
        variable.id === block.options?.dynamicVariableId &&
        isDefined(variable.value),
    ) as VariableWithValue | undefined;
    if (!variable) return block;
    const value = getVariableValue(variable, { variables }).filter(isNotEmpty);
    const uniqueValues = [...new Set(value)];
    return {
      ...deepParseVariables(block, {
        variables,
        sessionStore,
      }),
      items: uniqueValues.filter(isDefined).map((item, idx) => ({
        id: "choice" + idx.toString(),
        blockId: block.id,
        content: item,
      })),
    };
  }
  return deepParseVariables(
    filterChoiceItems(block, { sessionStore, variables }),
    {
      variables,
      sessionStore,
    },
  );
};

const getVariableValue = (
  variable: VariableWithValue,
  { variables }: { variables: Variable[] },
): (string | null)[] => {
  if (!Array.isArray(variable.value)) {
    const [transformedVariable] = transformVariablesToList(variables)([
      variable.id,
    ]);
    return transformedVariable.value as string[];
  }
  return variable.value;
};
