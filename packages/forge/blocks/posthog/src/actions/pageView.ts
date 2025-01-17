import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { createClient } from "../createClient";
import { createProperties } from "../createProperties";

interface EventPayload {
  distinctId: string;
  event: string;
  properties: {};
}

export const pageView = createAction({
  auth,
  name: "Page View",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
      isRequired: false,
    }),
    anonymous: option.boolean.layout({
      label: "Anonymous User",
      isRequired: false,
      defaultValue: false,
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
        accordion: "Page View properties",
      }),
  }),
  run: {
    server: async ({
      credentials: { apiKey, host },
      options: { userId, anonymous, properties },
    }) => {
      if (
        !userId ||
        userId.length === 0 ||
        apiKey === undefined ||
        host === undefined
      )
        return;

      const posthog = createClient(apiKey, host);

      const eventPayload: EventPayload = {
        distinctId: userId,
        event: "$pageview",
        properties: {},
      };

      if (properties !== undefined && properties.length > 0) {
        eventPayload.properties = createProperties(properties);
      }

      if (anonymous) {
        eventPayload.properties = {
          ...eventPayload.properties,
          $process_person_profile: false,
        };
      }

      posthog.capture(eventPayload);

      await posthog.shutdown();
    },
  },
});
