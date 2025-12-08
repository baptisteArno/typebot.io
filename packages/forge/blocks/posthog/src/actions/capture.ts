import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

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
});
