import type { Connection } from "@planetscale/database";
import { defaultOpenAIOptions } from "@typebot.io/blocks-integrations/openai/constants";
import type {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from "@typebot.io/blocks-integrations/openai/schema";
import { decryptV2 } from "@typebot.io/lib/api/encryption/decryptV2";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { parseVariableNumber } from "@typebot.io/variables/parseVariableNumber";
import { OpenAIStream } from "ai";
import { type ClientOptions, OpenAI } from "openai";
import type { SessionState } from "../../../../schemas/chatSession";

export const getChatCompletionStream =
  (conn: Connection) =>
  async (
    state: SessionState,
    options: ChatCompletionOpenAIOptions,
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ) => {
    if (!options.credentialsId) return;
    const credentials = (
      await conn.execute("select data, iv from Credentials where id=?", [
        options.credentialsId,
      ])
    ).rows.at(0) as { data: string; iv: string } | undefined;
    if (!credentials) {
      console.error("Could not find credentials in database");
      return;
    }
    const { apiKey } = (await decryptV2(
      credentials.data,
      credentials.iv,
    )) as OpenAICredentials["data"];

    const { typebot } = state.typebotsQueue[0];
    const temperature = parseVariableNumber(typebot.variables)(
      options.advancedSettings?.temperature,
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
