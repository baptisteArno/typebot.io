import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const capture = createAction({
  auth,
  name: "Capture",
  parseBlockNodeLabel: (options) => `Capture ${options.event}}`,
  options: option.object({
    isAnonymous: option.boolean.meta({
      layout: {
        label: "Anonymous",
        isRequired: false,
        defaultValue: false,
      },
    }),
    distinctId: option.string.meta({
      layout: {
        label: "Distinct ID",
        isRequired: false,
        isHidden: (current: { isAnonymous?: boolean }) =>
          Boolean(current.isAnonymous),
      },
    }),
    event: option.string.meta({
      layout: {
        label: "Event",
        isRequired: true,
      },
    }),
    properties: option
      .array(
        option.object({
          key: option.string.meta({
            layout: {
              label: "Key",
              isRequired: true,
            },
          }),
          value: option.string.meta({
            layout: {
              label: "Value",
              isRequired: true,
            },
          }),
        }),
      )
      .meta({
        layout: {
          itemLabel: "a property",
          accordion: "Properties",
        },
      }),
    personProperties: option
      .array(
        option.object({
          key: option.string.meta({
            layout: {
              label: "Key",
              isRequired: true,
            },
          }),
          value: option.string.meta({
            layout: {
              label: "Value",
              isRequired: true,
            },
          }),
        }),
      )
      .meta({
        layout: {
          itemLabel: "a property",
          accordion: "Person properties",
        },
      }),
    groups: option
      .array(
        option.object({
          type: option.string.meta({
            layout: {
              label: "Type",
              isRequired: true,
            },
          }),
          key: option.string.meta({
            layout: {
              label: "Key",
              isRequired: true,
            },
          }),
        }),
      )
      .meta({
        layout: {
          itemLabel: "a group",
          accordion: "Associated groups",
        },
      }),
  }),
});
