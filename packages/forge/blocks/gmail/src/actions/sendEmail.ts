import { createAction, option } from "@typebot.io/forge";
import { isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import { auth } from "../auth";

export const labelsFetcher = {
  id: "fetchLabels",
} as const;

export const sendEmail = createAction({
  auth,
  name: "Send email",
  options: option.object({
    to: option.string.meta({
      layout: {
        label: "To",
      },
    }),
    subject: option.string.meta({
      layout: {
        label: "Subject",
      },
    }),
    body: option.string.meta({
      layout: {
        label: "Body",
        inputType: "textarea",
      },
    }),
    attachments: option.string.meta({
      layout: {
        inputType: "variableDropdown",
        label: "Attachments",
        moreInfoTooltip:
          "File URLs to attach. Note: Gmail has a 25MB total attachment limit.",
      },
    }),
    label: option.string.meta({
      layout: {
        label: "Label",
        fetcher: labelsFetcher.id,
        withVariableButton: false,
        accordion: "Advanced configuration",
      },
    }),
    from: option.string.meta({
      layout: {
        label: "From",
        accordion: "Advanced configuration",
        placeholder: "John Doe <john.doe@gmail.com>",
      },
    }),
    threadId: option.string.meta({
      layout: {
        label: "Thread ID",
        accordion: "Advanced configuration",
        moreInfoTooltip:
          "If provided, the email will be sent as a reply of that specified thread.",
      },
    }),
    replyTo: option.string.meta({
      layout: {
        label: "Reply to",
        accordion: "Advanced configuration",
        placeholder: "john.doe@gmail.com",
        moreInfoTooltip:
          "If provided, the reply to this email will be set to the provided email address",
        isHidden: ({ threadId }: { threadId?: string | null }) =>
          isNotEmpty(threadId),
      },
    }),
    responseMapping: option.saveResponseArray(["Thread ID"]).meta({
      layout: {
        accordion: "Save response",
      },
    }),
  }),
  fetchers: [labelsFetcher],
  getSetVariableIds: (options) =>
    options.responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
});
