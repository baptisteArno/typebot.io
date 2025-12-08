import { Analytics } from "@segment/analytics-node";
import { createActionHandler } from "@typebot.io/forge";
import { trackPage } from "../actions/trackPage";

export const trackPageHandler = createActionHandler(trackPage, {
  server: async ({
    credentials: { apiKey },
    options: { userId, name, category, properties },
  }) => {
    if (
      !name ||
      name.length === 0 ||
      !userId ||
      userId.length === 0 ||
      apiKey === undefined
    )
      return;

    const analytics = new Analytics({ writeKey: apiKey });

    if (properties === undefined || properties.length === 0) {
      analytics.page({
        userId: userId,
        name: name,
        category: category !== undefined ? category : "",
      });
    } else {
      analytics.page({
        userId: userId,
        name: name,
        category: category !== undefined ? category : "",
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
