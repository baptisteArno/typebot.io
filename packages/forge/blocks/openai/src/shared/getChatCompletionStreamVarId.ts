import type { ChatCompletionOptions } from "./parseChatCompletionOptions";

export const getChatCompletionStreamVarId = (options: ChatCompletionOptions) =>
  options.responseMapping?.find(
    (res) => res.item === "Message content" || !res.item,
  )?.variableId;
