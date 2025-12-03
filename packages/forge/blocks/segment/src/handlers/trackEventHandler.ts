import { Analytics } from "@segment/analytics-node";
import { createActionHandler } from "@typebot.io/forge";
import { trackEvent } from "../actions/trackEvent";

export const trackEventHandler = createActionHandler(trackEvent, {
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
});

const createProperties = (properties: { key?: string; value?: string }[]) => {
  const props: Record<string, any> = {};

  properties.forEach(({ key, value }) => {
    if (!key || !value) return;
    props[key] = value;
  });

  return props;
};
