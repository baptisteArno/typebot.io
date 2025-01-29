import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { createClient } from "../helpers/createClient";
import { parseProperties } from "../helpers/parseProperties";

export const identify = createAction({
  auth,
  name: "Identify User",
  options: option.object({
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
        accordion: "User properties",
      }),
  }),
  run: {
    server: async ({
      credentials: { apiKey, host },
      options: { userId, properties },
    }) => {
      if (
        !userId ||
        userId.length === 0 ||
        apiKey === undefined ||
        host === undefined
      )
        return;

      const posthog = createClient(apiKey, host);

      if (properties === undefined || properties.length === 0) {
        posthog.identify({
          distinctId: userId,
        });
      } else {
        posthog.identify({
          distinctId: userId,
          properties: parseProperties(properties),
        });
      }
      await posthog.shutdownAsync();
    },
  },
});
