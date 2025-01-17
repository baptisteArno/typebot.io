import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { createClient } from "../createClient";
import { createProperties } from "../createProperties";

interface GroupPayload {
  groupType: string;
  groupKey: string;
  distinctId?: string;
  properties?: {};
}

export const identifyGroup = createAction({
  auth,
  name: "Identify Group",
  options: option.object({
    groupKey: option.string.layout({
      label: "Group Key",
      isRequired: true,
    }),
    groupType: option.string.layout({
      label: "Group Type",
      isRequired: true,
    }),
    userId: option.string.layout({
      label: "User ID",
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
      credentials: { apiKey, host },
      options: { userId, groupKey, groupType, properties },
    }) => {
      if (
        !groupKey ||
        groupKey.length === 0 ||
        !groupType ||
        groupType.length === 0 ||
        apiKey === undefined ||
        host === undefined
      )
        return;

      const posthog = createClient(apiKey, host);

      let groupPayload: GroupPayload = {
        groupType: groupType,
        groupKey: groupKey,
      };

      if (userId) {
        groupPayload = {
          ...groupPayload,
          distinctId: userId,
        };
      }

      if (properties) {
        groupPayload = {
          ...groupPayload,
          properties: createProperties(properties),
        };
      }

      posthog.groupIdentify(groupPayload);

      await posthog.shutdown();
    },
  },
});
