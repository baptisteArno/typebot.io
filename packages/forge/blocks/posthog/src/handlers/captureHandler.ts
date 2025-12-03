import { createActionHandler } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { capture } from "../actions/capture";
import { createClient } from "../helpers/createClient";
import { parseGroups } from "../helpers/parseGroups";
import { parseProperties } from "../helpers/parseProperties";

export const captureHandler = createActionHandler(capture, {
  server: async ({
    credentials: { apiKey, host },
    options: {
      event,
      distinctId,
      isAnonymous,
      groups,
      properties,
      personProperties,
    },
    logs,
  }) => {
    if (
      event === undefined ||
      event.length === 0 ||
      !distinctId ||
      distinctId.length === 0 ||
      apiKey === undefined ||
      host === undefined
    ) {
      logs.add("PostHog Capture: Missing required fields");
      return;
    }

    const posthog = createClient(apiKey, host);

    posthog.capture({
      distinctId: isAnonymous ? createId() : distinctId,
      event,
      properties: parseProperties({
        properties,
        personProperties,
        isAnonymous,
      }),
      groups: parseGroups(groups),
    });

    await posthog.shutdown();
  },
});
