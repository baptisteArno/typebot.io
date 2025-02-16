import { parseChatCompletionMessages } from "@typebot.io/ai/parseChatCompletionMessages";
import type { ChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import type { Tools } from "@typebot.io/ai/schemas";
import type { Message } from "@typebot.io/ai/types";
import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import axios from "axios";
import { API_URL } from "../constants";

type Props = {
  model: string;
  variables: VariableStore;
  messages: Message[];
  tools?: Tools;
  isVisionEnabled: boolean | undefined;
  temperature: number | undefined;
  logs: LogsStore;
  responseMapping: ChatCompletionOptions["responseMapping"] | undefined;
  apiKey: string;
};

export const runApiChatCompletion = async ({
  model,
  variables,
  messages,
  tools,
  isVisionEnabled,
  temperature,
  logs,
  responseMapping,
  apiKey,
}: Props) => {
  try {
    const apiResponse = await axios.post(
      API_URL,
      {
        model,
        messages: await parseChatCompletionMessages({
          messages,
          variables,
          isVisionEnabled: isVisionEnabled ?? false,
          shouldDownloadImages: false,
        }),
        isVisionEnabled,
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { choices, usage } = apiResponse.data;

    responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return;
      if (!mapping.item || mapping.item === "Message content")
        variables.set([
          { id: mapping.variableId, value: choices[0].message.content },
        ]);
      if (mapping.item === "Total tokens")
        variables.set([{ id: mapping.variableId, value: usage.total_tokens }]);
    });
  } catch (err) {
    logs.add({
      status: "error",
      description: "An API call error occured while generating the response",
      details: err,
    });
  }
};
