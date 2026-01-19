import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const identify = createAction({
  auth,
  name: "Identify User",
  options: option.object({
    userId: option.string.meta({
      layout: {
        label: "User ID",
        isRequired: true,
      },
    }),
    email: option.string.meta({
      layout: {
        label: "Email",
        isRequired: false,
      },
    }),
    traits: option
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
          itemLabel: "trait",
        },
      }),
  }),
});
