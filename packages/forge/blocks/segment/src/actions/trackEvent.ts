import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const trackEvent = createAction({
  auth,
  name: "Track",
  options: option.object({
    eventName: option.string.meta({
      layout: {
        label: "Name",
        isRequired: true,
      },
    }),
    userId: option.string.meta({
      layout: {
        label: "User ID",
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
