import { Analytics } from "@segment/analytics-node";
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
  run: {
    server: async ({
      credentials: { apiKey },
      options: { eventName, userId, properties },
    }) => {
      if (
        !eventName ||
        eventName.length === 0 ||
        !userId ||
        userId.length === 0 ||
        apiKey === undefined
      )
        return;

      const analytics = new Analytics({ writeKey: apiKey });

      if (properties === undefined || properties.length === 0) {
        analytics.track({
          userId: userId,
          event: eventName,
        });
      } else {
        analytics.track({
          userId: userId,
          event: eventName,
          properties: createProperties(properties),
        });
      }
      await analytics.closeAndFlush();
    },
  },
});

const createProperties = (properties: { key?: string; value?: string }[]) => {
  const props: Record<string, any> = {};

  properties.forEach(({ key, value }) => {
    if (!key || !value) return;
    props[key] = value;
  });

  return props;
};
