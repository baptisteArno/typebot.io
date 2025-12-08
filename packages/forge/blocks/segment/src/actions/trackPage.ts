import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const trackPage = createAction({
  auth,
  name: "Page",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
      isRequired: true,
    }),
    name: option.string.layout({
      label: "Name",
      isRequired: true,
    }),
    category: option.string.layout({
      label: "Category",
      isRequired: false,
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
