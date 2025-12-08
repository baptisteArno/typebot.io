import { Analytics } from "@segment/analytics-node";
import { createActionHandler } from "@typebot.io/forge";
import { identify } from "../actions/identify";

export const identifyHandler = createActionHandler(identify, {
  server: async ({
    credentials: { apiKey },
    options: { userId, email, traits },
  }) => {
    if (
      !email ||
      email.length === 0 ||
      !userId ||
      userId.length === 0 ||
      apiKey === undefined
    )
      return;

    const analytics = new Analytics({ writeKey: apiKey });

    if (traits === undefined || traits.length === 0) {
      analytics.identify({
        userId: userId,
        traits: {
          email: email,
        },
      });
    } else {
      analytics.identify({
        userId: userId,
        traits: createTraits(traits, email),
      });
    }
    await analytics.closeAndFlush();
  },
});

const createTraits = (
  traits: { key?: string; value?: string }[],
  email: string,
) => {
  const _traits: Record<string, any> = {};

  // add email as a default trait
  traits.push({ key: "email", value: email });

  traits.forEach(({ key, value }) => {
    if (!key || !value) return;
    _traits[key] = value;
  });

  return _traits;
};
