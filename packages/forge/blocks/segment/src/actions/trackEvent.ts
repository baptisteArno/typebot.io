import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const trackEvent = createAction({
  auth,
  name: "Track",
  options: option.object({
    eventName: option.string.layout({
      label: "Name",
      isRequired: true,
    }),
    userId: option.string.layout({
      label: "User ID",
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
