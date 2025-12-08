import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const identifyGroup = createAction({
  auth,
  name: "Identify Group",
  options: option.object({
    distinctId: option.string.layout({
      label: "Distinct ID",
      isRequired: false,
    }),
    groupType: option.string.layout({
      label: "Type",
      isRequired: true,
    }),
    groupKey: option.string.layout({
      label: "Key",
      isRequired: true,
    }),
    properties: option
      .array(
        option.object({
          key: option.string.layout({
            label: "Key",
            isRequired: true,
          }),
          value: option.string.layout({
            label: "Value",
            isRequired: true,
          }),
        }),
      )
      .layout({
        itemLabel: "property",
      }),
  }),
});
