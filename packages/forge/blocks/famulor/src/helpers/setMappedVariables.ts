import type { VariableStore } from "@typebot.io/forge/types";

export const setMappedVariables = <Item extends string>(
  variables: VariableStore,
  responseMapping: { item?: Item; variableId?: string }[] | undefined,
  readValue: (item: Item) => unknown,
) => {
  const updates =
    responseMapping?.flatMap((mapping) => {
      if (!mapping.item || !mapping.variableId) return [];
      return [{ id: mapping.variableId, value: readValue(mapping.item) }];
    }) ?? [];

  if (updates.length > 0) variables.set(updates);
};
