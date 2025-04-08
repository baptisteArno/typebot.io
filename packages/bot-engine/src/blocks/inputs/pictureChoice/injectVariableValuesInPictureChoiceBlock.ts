import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type {
  Variable,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { filterPictureChoiceItems } from "./filterPictureChoiceItems";

export const injectVariableValuesInPictureChoiceBlock = (
  block: PictureChoiceBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): PictureChoiceBlock => {
  if (
    block.options?.dynamicItems?.isEnabled &&
    block.options.dynamicItems.pictureSrcsVariableId
  ) {
    const pictureSrcsVariable = variables.find(
      (variable) =>
        variable.id === block.options?.dynamicItems?.pictureSrcsVariableId &&
        isDefined(variable.value),
    ) as VariableWithValue | undefined;
    if (!pictureSrcsVariable)
      return deepParseVariables(block, { variables, sessionStore });
    const titlesVariable = block.options.dynamicItems.titlesVariableId
      ? (variables.find(
          (variable) =>
            variable.id === block.options?.dynamicItems?.titlesVariableId &&
            isDefined(variable.value),
        ) as VariableWithValue | undefined)
      : undefined;
    const titlesVariableValues =
      typeof titlesVariable?.value === "string"
        ? [titlesVariable.value]
        : titlesVariable?.value;
    const descriptionsVariable = block.options.dynamicItems
      .descriptionsVariableId
      ? (variables.find(
          (variable) =>
            variable.id ===
              block.options?.dynamicItems?.descriptionsVariableId &&
            isDefined(variable.value),
        ) as VariableWithValue | undefined)
      : undefined;
    const descriptionsVariableValues =
      typeof descriptionsVariable?.value === "string"
        ? [descriptionsVariable.value]
        : descriptionsVariable?.value;

    const variableValues =
      typeof pictureSrcsVariable.value === "string"
        ? [pictureSrcsVariable.value]
        : pictureSrcsVariable.value;

    return {
      ...deepParseVariables(block, { variables, sessionStore }),
      items: variableValues.filter(isDefined).map((pictureSrc, idx) => ({
        id: idx.toString(),
        blockId: block.id,
        pictureSrc,
        title: titlesVariableValues?.[idx] ?? "",
        description: descriptionsVariableValues?.[idx] ?? "",
      })),
    };
  }
  return deepParseVariables(
    filterPictureChoiceItems(block, { variables, sessionStore }),
    {
      variables,
      sessionStore,
    },
  );
};
