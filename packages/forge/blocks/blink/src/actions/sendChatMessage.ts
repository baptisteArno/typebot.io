import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";

export const sendChatMessage = createAction({
  name: "Send Chat Message",
  auth,
  options: option.object({
    userIds: option.string.meta({
      layout: {
        label: "Recipient user IDs",
        placeholder: "u-..., u-...",
        helperText:
          "Separate IDs with commas or insert a list variable, for example the User IDs saved by the Get Users action. Each recipient gets the message in a direct chat with your App Identity.",
      },
    }),
    message: option.string.meta({
      layout: {
        label: "Message",
        inputType: "textarea",
        helperText: "Supports Markdown.",
      },
    }),
    unfurlLinks: option.boolean.meta({
      layout: {
        label: "Show link previews",
        defaultValue: true,
      },
    }),
    responseMapping: option
      .saveResponseArray(["Sent count", "Failed user IDs"])
      .optional()
      .meta({
        layout: {
          accordion: "Save in variables",
        },
      }),
  }),
  getSetVariableIds: (options) =>
    options.responseMapping?.map((v) => v.variableId).filter(isDefined) ?? [],
});
