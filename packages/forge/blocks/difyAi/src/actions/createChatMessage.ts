import { chatCompletionResponseValues } from "@typebot.io/ai/constants";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { LEGACY_RESPONSE_MAPPING } from "../constants";
import { transformLegacyResponseMapping } from "../helpers/transformLegacyResponseMapping";

const options = option.object({
  query: option.string.meta({
    layout: {
      label: "Query",
      placeholder: "User input/question content",
      inputType: "textarea",
      isRequired: true,
    },
  }),
  conversationVariableId: option.string.meta({
    layout: {
      label: "Conversation ID",
      moreInfoTooltip:
        "Used to remember the conversation with the user. If empty, a new conversation ID is created.",
      inputType: "variableDropdown",
    },
  }),
  user: option.string.meta({
    layout: {
      label: "User",
      moreInfoTooltip:
        "The user identifier, defined by the developer, must ensure uniqueness within the app.",
      isHidden: true,
    },
  }),
  inputs: option
    .array(
      option.object({
        key: option.string.meta({ layout: { label: "Key" } }),
        value: option.string.meta({ layout: { label: "Value" } }),
      }),
    )
    .meta({ layout: { accordion: "Inputs" } }),
  responseMapping: option
    .saveResponseArray(
      [...LEGACY_RESPONSE_MAPPING, ...chatCompletionResponseValues],
      {
        item: {
          hiddenItems: LEGACY_RESPONSE_MAPPING,
        },
      },
    )
    .meta({
      layout: {
        accordion: "Save response",
      },
    })
    .transform(transformLegacyResponseMapping),
});

export const createChatMessage = createAction({
  name: "Create Chat Message",
  auth,
  options,
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  getStreamVariableId: ({ responseMapping }) =>
    responseMapping?.find((res) => res.item === "Message content")?.variableId,
});
