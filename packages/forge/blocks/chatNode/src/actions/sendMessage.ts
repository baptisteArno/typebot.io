import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";

export const sendMessage = createAction({
  auth,
  name: "Send Message",
  turnableInto: undefined,
  options: option.object({
    botId: option.string.layout({
      label: "Bot ID",
      placeholder: "68c052c5c3680f63",
      moreInfoTooltip:
        "The bot_id you want to ask question to. You can find it at the end of your ChatBot URl in your dashboard",
    }),
    threadId: option.string.layout({
      label: "Thread ID",
      moreInfoTooltip:
        "Used to remember the conversation with the user. If empty, a new thread is created.",
    }),
    message: option.string.layout({
      label: "Message",
      placeholder: "Hi, what can I do with ChatNode",
      inputType: "textarea",
    }),
    responseMapping: option.saveResponseArray(["Message", "Thread ID"]).layout({
      accordion: "Save response",
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
});
