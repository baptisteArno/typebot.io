import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const identify = createAction({
  auth,
  name: "Identify User",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
      isRequired: true,
    }),
    email: option.string.layout({
      label: "Email",
      isRequired: false,
    }),
    traits: option
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
        itemLabel: "trait",
      }),
  }),
});
