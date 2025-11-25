import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";
import type {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from "@typebot.io/blocks-integrations/openai/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { decryptV2 } from "@typebot.io/credentials/decryptV2";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariableNumber } from "@typebot.io/variables/parseVariableNumber";
import { type ClientOptions, OpenAI } from "openai";
import { OpenAIStream } from "./ai";

export const getOpenAIChatCompletionStream = async (
  state: SessionState,
  options: ChatCompletionOpenAIOptions,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  sessionStore: SessionStore,
) => {
  if (!options.credentialsId) return;
  const credentials = await getCredentials(
    options.credentialsId,
    state.workspaceId,
  );
  if (!credentials) {
    console.error("Could not find credentials in database");
    return;
  }
  const { apiKey } = (await decryptV2(
    credentials.data,
    credentials.iv,
  )) as OpenAICredentials["data"];

  const { typebot } = state.typebotsQueue[0];
  const temperature = parseVariableNumber(
    options.advancedSettings?.temperature,
    {
      variables: typebot.variables,
      sessionStore,
    },
  );

  const config = {
    apiKey,
    baseURL: options.baseUrl,
    defaultHeaders: {
      "api-key": apiKey,
    },
    defaultQuery: isNotEmpty(options.apiVersion)
      ? {
          "api-version": options.apiVersion,
        }
      : undefined,
  } satisfies ClientOptions;

  const openai = new OpenAI(config);

  const response = await openai.chat.completions.create({
    model: options.model ?? defaultOpenAIOptions.model,
    temperature,
    stream: true,
    messages,
  });

  return OpenAIStream(response);
};
