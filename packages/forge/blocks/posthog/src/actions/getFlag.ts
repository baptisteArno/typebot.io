import { createAction, option } from "@typebot.io/forge";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { createClient } from "../createClient";
import { createProperties } from "../createProperties";

export const getFlag = createAction({
  auth,
  name: "Get Flag",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
      isRequired: true,
    }),
    flagKey: option.string.layout({
      label: "Flag Key",
      isRequired: true,
    }),
    responseMapping: option
      .saveResponseArray(["Flag Payload"] as const)
      .layout({
        accordion: "Save payload",
      }),
    multivariate: option.boolean.layout({
      label: "Multivariate",
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
      }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiKey, host },
      options: { userId, flagKey, responseMapping, multivariate, properties },
      variables,
    }) => {
      if (
        !userId ||
        userId.length === 0 ||
        !flagKey ||
        flagKey.length === 0 ||
        apiKey === undefined ||
        host === undefined
      )
        return;

      const posthog = createClient(apiKey, host);

      let isFeatureFlagEnabled = false;
      let matchedFlagPayload = null;

      if (!multivariate) {
        isFeatureFlagEnabled =
          (await posthog.isFeatureEnabled(flagKey, userId)) ?? false;
        if (isFeatureFlagEnabled) {
          matchedFlagPayload = await posthog.getFeatureFlagPayload(
            flagKey,
            userId,
            isFeatureFlagEnabled,
          );
        }
      } else {
        let enabledVariant = null;

        if (properties) {
          const personProperties = createProperties(properties);
          enabledVariant = await posthog.getFeatureFlag(
            flagKey,
            userId,
            personProperties,
          );
        } else {
          enabledVariant =
            (await posthog.getFeatureFlag(flagKey, userId)) ?? false;
        }
        matchedFlagPayload = await posthog.getFeatureFlagPayload(
          flagKey,
          userId,
          enabledVariant,
        );
      }

      if (responseMapping) {
        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;
          if (!mapping.item || mapping.item === "Flag Payload") {
            variables.set([
              { id: mapping.variableId, value: matchedFlagPayload },
            ]);
          }
        });
      }

      await posthog.shutdown();
    },
  },
});
