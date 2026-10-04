import { createAction, option } from "@typebot.io/forge";

export const hostAction = createAction({
  name: "Execute Action",
  options: option.object({
    actionKey: option.string.meta({
      layout: { label: "Action key", isRequired: true },
    }),
    inputs: option
      .array(
        option.object({
          key: option.string.meta({ layout: { label: "Key" } }),
          value: option.string.meta({
            layout: { label: "Value", inputType: "textarea" },
          }),
        }),
      )
      .meta({ layout: { accordion: "Inputs" } }),
    outputVariableId: option.string.meta({
      layout: { label: "Save result", inputType: "variableDropdown" },
    }),
  }),
  getSetVariableIds: ({ outputVariableId }) =>
    outputVariableId ? [outputVariableId] : [],
});
