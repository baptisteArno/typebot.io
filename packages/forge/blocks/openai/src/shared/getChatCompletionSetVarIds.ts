import { isDefined } from "@typebot.io/lib/utils";
import type { ChatCompletionOptions } from "./parseChatCompletionOptions";

export const getChatCompletionSetVarIds = (options: ChatCompletionOptions) =>
  options.responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [];
