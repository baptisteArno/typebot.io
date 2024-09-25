import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import { transformVariablesToList } from "@typebot.io/variables/transformVariablesToList";
import type { SessionState } from "../../../schemas/chatSession";
import { filterChoiceItems } from "./filterChoiceItems";

export const injectVariableValuesInButtonsInputBlock =
  (state: SessionState) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const { variables } = state.typebotsQueue[0].typebot;
    if (block.options?.dynamicVariableId) {
      const variable = variables.find(
        (variable) =>
          variable.id === block.options?.dynamicVariableId &&
          isDefined(variable.value),
      ) as VariableWithValue | undefined;
      if (!variable) return block;
      const value = getVariableValue(state)(variable);
      return {
        ...deepParseVariables(variables)(block),
        items: value.filter(isDefined).map((item, idx) => ({
          id: "choice" + idx.toString(),
          blockId: block.id,
          content: item,
        })),
      };
    }
    return deepParseVariables(variables)(filterChoiceItems(variables)(block));
  };

const getVariableValue =
  (state: SessionState) =>
  (variable: VariableWithValue): (string | null)[] => {
    if (!Array.isArray(variable.value)) {
      const { variables } = state.typebotsQueue[0].typebot;
      const [transformedVariable] = transformVariablesToList(variables)([
        variable.id,
      ]);
      return transformedVariable.value as string[];
    }
    return variable.value;
  };
