import { createActionHandler } from "@typebot.io/forge";
import { identifyGroup } from "../actions/identifyGroup";
import { createClient } from "../helpers/createClient";
import { parseProperties } from "../helpers/parseProperties";

export const identifyGroupHandler = createActionHandler(identifyGroup, {
  server: async ({
    credentials: { apiKey, host },
    options: { distinctId, groupKey, groupType, properties },
    logs,
  }) => {
    if (!apiKey) return;

    const posthog = createClient(apiKey, host);

    if (!distinctId) return logs.add("Distinct ID is required");

    if (!groupKey || !groupType)
      return logs.add("Group type and key are required");

    posthog.groupIdentify({
      distinctId,
      groupType,
      groupKey,
      properties: parseProperties({ properties }),
    });

    await posthog.shutdown();
  },
});
