import { createAction, option } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { auth } from "../auth";
import { createClient } from "../helpers/createClient";
import { parseGroups } from "../helpers/parseGroups";
import { parseProperties } from "../helpers/parseProperties";

export const capture = createAction({
  auth,
  name: "Capture",
  parseBlockNodeLabel: (options) => `Capture ${options.event}`,
  options: option.object({
    isAnonymous: option.boolean.layout({
      label: "Anonymous",
      isRequired: false,
      defaultValue: false,
    }),
    distinctId: option.string.layout({
      label: "Distinct ID",
      isRequired: false,
      isHidden: (props) => props.isAnonymous,
    }),
    event: option.string.layout({
      label: "Event",
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
        itemLabel: "a property",
        accordion: "Properties",
      }),
    personProperties: option
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
        itemLabel: "a property",
        accordion: "Person properties",
      }),
    groups: option
      .array(
        option.object({
          type: option.string.layout({
            label: "Type",
            isRequired: true,
          }),
          key: option.string.layout({
            label: "Key",
            isRequired: true,
          }),
        }),
      )
      .layout({
        itemLabel: "a group",
        accordion: "Associated groups",
      }),
  }),
  run: {
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
  },
});
