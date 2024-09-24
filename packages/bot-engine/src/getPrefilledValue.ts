import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const getPrefilledInputValue =
  (variables: Variable[]) => (block: InputBlock) => {
    const variableValue = variables.find(
      (variable) =>
        variable.id === block.options?.variableId && isDefined(variable.value),
    )?.value;
    if (!variableValue || Array.isArray(variableValue)) return;
    return variableValue;
  };
