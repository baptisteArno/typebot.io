import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { type LanguageModel, generateText } from "ai";
import { maxSteps } from "./constants";
import { parseChatCompletionMessages } from "./parseChatCompletionMessages";
import type { ChatCompletionOptions } from "./parseChatCompletionOptions";
import { parseTools } from "./parseTools";
import type { Tools } from "./schemas";
import type { Message } from "./types";

type Props = {
  model: LanguageModel;
  variables: VariableStore;
  messages: Message[];
  tools: Tools | undefined;
  isVisionEnabled: boolean;
  temperature: number | undefined;
  logs: LogsStore;
  responseMapping: ChatCompletionOptions["responseMapping"] | undefined;
  sessionStore: SessionStore;
};

export const runChatCompletion = async ({
  variables,
  messages,
  model,
  isVisionEnabled,
  temperature,
  tools,
  responseMapping,
  logs,
  sessionStore,
}: Props) => {
  try {
    const { text, usage } = await generateText({
      model,
      temperature,
      messages: await parseChatCompletionMessages({
        messages,
        variables,
        isVisionEnabled,
        shouldDownloadImages: false,
      }),
      tools: parseTools({ tools, variables, sessionStore }),
      maxSteps,
    });

    responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return;
      if (!mapping.item || mapping.item === "Message content")
        variables.set([{ id: mapping.variableId, value: text }]);
      if (mapping.item === "Total tokens")
        variables.set([{ id: mapping.variableId, value: usage.totalTokens }]);
      if (mapping.item === "Prompt tokens")
        variables.set([{ id: mapping.variableId, value: usage.promptTokens }]);
      if (mapping.item === "Completion tokens")
        variables.set([
          { id: mapping.variableId, value: usage.completionTokens },
        ]);
    });
  } catch (err) {
    logs.add(
      await parseUnknownError({
        err,
        context: "While generating chat completion",
      }),
    );
  }
};
