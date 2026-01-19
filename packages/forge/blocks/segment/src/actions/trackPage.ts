import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const trackPage = createAction({
  auth,
  name: "Page",
  options: option.object({
    userId: option.string.meta({
      layout: {
        label: "User ID",
        isRequired: true,
      },
    }),
    name: option.string.meta({
      layout: {
        label: "Name",
        isRequired: true,
      },
    }),
    category: option.string.meta({
      layout: {
        label: "Category",
        isRequired: false,
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
