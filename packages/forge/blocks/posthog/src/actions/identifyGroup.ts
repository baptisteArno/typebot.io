import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const identifyGroup = createAction({
  auth,
  name: "Identify Group",
  options: option.object({
    distinctId: option.string.meta({
      layout: {
        label: "Distinct ID",
        isRequired: false,
      },
    }),
    groupType: option.string.meta({
      layout: {
        label: "Type",
        isRequired: true,
      },
    }),
    groupKey: option.string.meta({
      layout: {
        label: "Key",
        isRequired: true,
      },
    }),
    properties: option
      .array(
        option.object({
          key: option.string.meta({
            layout: {
              label: "Key",
              isRequired: true,
            },
          }),
          value: option.string.meta({
            layout: {
              label: "Value",
              isRequired: true,
            },
          }),
        }),
      )
      .meta({
        layout: {
          itemLabel: "property",
        },
      }),
  }),
});
