import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { createClient } from "../helpers/createClient";
import { parseProperties } from "../helpers/parseProperties";

export const identifyGroup = createAction({
  auth,
  name: "Identify Group",
  options: option.object({
    distinctId: option.string.layout({
      label: "Distinct ID",
      isRequired: false,
    }),
    groupType: option.string.layout({
      label: "Type",
      isRequired: true,
    }),
    groupKey: option.string.layout({
      label: "Key",
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
  },
});
