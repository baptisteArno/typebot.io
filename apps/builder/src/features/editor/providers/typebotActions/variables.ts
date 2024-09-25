import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";
import { type Draft, produce } from "immer";
import type { SetTypebot } from "../TypebotProvider";

export type VariablesActions = {
  createVariable: (variable: Variable) => void;
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, "id">>,
  ) => void;
  deleteVariable: (variableId: string) => void;
};

export const variablesAction = (setTypebot: SetTypebot): VariablesActions => ({
  createVariable: (newVariable: Variable) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.variables.unshift(newVariable);
      }),
    ),
  updateVariable: (
    variableId: string,
    updates: Partial<Omit<Variable, "id">>,
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.variables = typebot.variables.map((v) =>
          v.id === variableId ? { ...v, ...updates } : v,
        );
      }),
    ),
  deleteVariable: (itemId: string) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteVariableDraft(typebot, itemId);
      }),
    ),
});

export const deleteVariableDraft = (
  typebot: Draft<Typebot>,
  variableId: string,
) => {
  const index = typebot.variables.findIndex((v) => v.id === variableId);
  typebot.variables.splice(index, 1);
};
