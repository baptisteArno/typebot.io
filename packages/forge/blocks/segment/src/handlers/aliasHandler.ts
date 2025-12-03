import { Analytics } from "@segment/analytics-node";
import { createActionHandler } from "@typebot.io/forge";
import { alias as aliasAction } from "../actions/alias";

export const aliasHandler = createActionHandler(aliasAction, {
  server: async ({
    credentials: { apiKey },
    options: { userId, previousId },
  }) => {
    if (
      !userId ||
      userId.length === 0 ||
      !previousId ||
      previousId.length === 0 ||
      apiKey === undefined
    )
      return;

    const analytics = new Analytics({ writeKey: apiKey });

    analytics.alias({
      userId: userId,
      previousId: previousId,
    });

    await analytics.closeAndFlush();
  },
});
