import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { startCallResponseItems } from "../constants";

export const assistantsFetcher = {
  id: "fetchAssistants",
} as const;

export const phoneNumbersFetcher = {
  id: "fetchPhoneNumbers",
} as const;

export const startCall = createAction({
  name: "Start call",
  auth,
  options: option.object({
    assistantId: option.string.meta({
      layout: {
        fetcher: assistantsFetcher.id,
        label: "Assistant",
        isRequired: true,
        placeholder: "Select an assistant",
      },
    }),
    toNumber: option.string.meta({
      layout: {
        label: "To",
        isRequired: true,
        placeholder: "+4930123456",
        helperText: "Destination phone number in E.164 format.",
      },
    }),
    phoneNumberId: option.string.meta({
      layout: {
        fetcher: phoneNumbersFetcher.id,
        label: "Caller ID",
        placeholder: "Assistant default",
        accordion: "Caller ID",
        helperText:
          "Optional outbound number. Leave empty to use the number assigned to the assistant.",
      },
    }),
    leadName: option.string.meta({
      layout: { label: "Name", accordion: "Lead" },
    }),
    leadEmail: option.string.meta({
      layout: { label: "Email", accordion: "Lead" },
    }),
    leadPhone: option.string.meta({
      layout: { label: "Phone", accordion: "Lead" },
    }),
    leadCompany: option.string.meta({
      layout: { label: "Company", accordion: "Lead" },
    }),
    responseMapping: option.saveResponseArray(startCallResponseItems).meta({
      layout: { accordion: "Save response" },
    }),
  }),
  fetchers: [assistantsFetcher, phoneNumbersFetcher],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((mapping) => mapping.variableId).filter(isDefined) ??
    [],
});
