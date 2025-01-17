import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { createClient } from "../createClient";
import { createProperties } from "../createProperties";

interface EventPayload {
  distinctId: string;
  event: string;
  properties: {};
  groups?: {};
}

export const capture = createAction({
  auth,
  name: "Capture",
  options: option.object({
    eventName: option.string.layout({
      label: "Event Name",
      isRequired: true,
    }),
    userId: option.string.layout({
      label: "User ID",
      isRequired: false,
    }),
    anonymous: option.boolean.layout({
      label: "Anonymous User",
      isRequired: false,
      defaultValue: false,
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
        accordion: "Event properties",
      }),
    groupKey: option.string.layout({
      label: "Group Key",
      isRequired: false,
      accordion: "Group settings",
    }),
    groupType: option.string.layout({
      label: "Group Type",
      isRequired: false,
      accordion: "Group settings",
    }),
  }),
  run: {
    server: async ({
      credentials: { apiKey, host },
      options: {
        eventName,
        userId,
        anonymous,
        groupKey,
        groupType,
        properties,
      },
    }) => {
      if (
        !eventName ||
        eventName.length === 0 ||
        !userId ||
        userId.length === 0 ||
        apiKey === undefined ||
        host === undefined
      )
        return;

      const posthog = createClient(apiKey, host);

      let eventPayload: EventPayload = {
        distinctId: userId,
        event: eventName,
        properties: {},
      };

      if (properties !== undefined && properties.length > 0) {
        eventPayload.properties = createProperties(properties);
      }

      if (
        groupType !== undefined &&
        groupType.length > 0 &&
        groupKey !== undefined &&
        groupKey.length > 0
      ) {
        eventPayload = {
          ...eventPayload,
          groups: { [`${groupType}`]: groupKey },
        };
      }

      if (anonymous) {
        eventPayload.properties = {
          ...eventPayload.properties,
          $process_person_profile: false,
        };
      }
      posthog.capture(eventPayload);

      await posthog.shutdown();
    },
  },
});
