import { Analytics } from "@segment/analytics-node";
import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const trackPage = createAction({
  auth,
  name: "Page",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
      isRequired: true,
    }),
    name: option.string.layout({
      label: "Name",
      isRequired: true,
    }),
    category: option.string.layout({
      label: "Category",
      isRequired: false,
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
