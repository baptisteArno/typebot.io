import { formatDataStreamPart } from "@ai-sdk/ui-utils";
import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import { deprecatedCreateChatMessageOptions } from "../deprecated";
import type { Chunk } from "../types";

interface DifyBlockingResponse {
  answer: string;
  conversation_id: string;
  metadata: {
    usage: {
      total_tokens: number;
    };
  };
}

interface DifyRequestPayload {
  inputs: Record<string, string>;
  query: string | undefined;
  response_mode: string | undefined;
  conversation_id?: string | (string | null)[] | null;
  user?: string;
  files: never[];
  timeout: boolean;
}

interface ProcessedResponse {
  answer: string;
  conversationId: string | undefined;
  totalTokens: number | undefined;
}

const buildDifyRequest = ({
  apiEndpoint,
  apiKey,
  query,
  response_mode,
  existingDifyConversationId,
  user,
  inputs,
}: {
  apiEndpoint?: string;
  apiKey: string | undefined;
  query: string | undefined;
  response_mode: string | undefined;
  existingDifyConversationId?: string | (string | null)[] | null;
  user?: string;
  inputs?: Array<{ key?: string; value?: string }>;
}) => {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const cleanedExistingId = Array.isArray(existingDifyConversationId)
    ? existingDifyConversationId[0] || undefined
    : existingDifyConversationId || undefined;

  const payload: DifyRequestPayload = {
    inputs:
      inputs?.reduce((acc, { key, value }) => {
        if (isEmpty(key) || isEmpty(value)) return acc;
        return { ...acc, [key!]: value! };
      }, {}) ?? {},
    query,
    response_mode,
    conversation_id: cleanedExistingId,
    user,
    files: [],
    timeout: false,
  };

  return ky((apiEndpoint ?? defaultBaseUrl) + "/v1/chat-messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

const setResponseVariables = ({
  variables,
  responseMapping,
  answer,
  conversationId,
  totalTokens,
  conversationVariableId,
  existingDifyConversationId,
}: {
  variables: any;
  responseMapping?: Array<{ variableId?: string; item?: string }>;
  answer: string;
  conversationId?: string;
  totalTokens?: number;
  conversationVariableId?: string;
  existingDifyConversationId?: string | (string | null)[] | null;
}) => {
  const cleanedExistingId = Array.isArray(existingDifyConversationId)
    ? existingDifyConversationId[0] || undefined
    : existingDifyConversationId || undefined;

  if (
    conversationVariableId &&
    isNotEmpty(conversationId) &&
    isEmpty(cleanedExistingId?.toString())
  ) {
    variables.set([{ id: conversationVariableId, value: conversationId }]);
  }

  responseMapping?.forEach((mapping) => {
    if (!mapping.variableId) return;

    const item = mapping.item ?? "Answer";
    if (item === "Answer") {
      variables.set([
        {
          id: mapping.variableId,
          value: convertNonMarkdownLinks(answer),
        },
      ]);
    }

    if (
      item === "Conversation ID" &&
      isNotEmpty(conversationId) &&
      isEmpty(cleanedExistingId?.toString())
    ) {
      variables.set([{ id: mapping.variableId, value: conversationId }]);
    }

    if (item === "Total Tokens") {
      variables.set([{ id: mapping.variableId, value: totalTokens }]);
    }
  });
};

const handleBlockingResponse = async (
  response: Response,
): Promise<ProcessedResponse> => {
  const data = (await response.json()) as DifyBlockingResponse;
  return {
    answer: data.answer || "",
    conversationId: data.conversation_id,
    totalTokens: data.metadata?.usage?.total_tokens,
  };
};

const handleStreamingResponse = async (
  response: Response,
): Promise<ProcessedResponse> => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Could not get reader from Dify response");
  }

  return new Promise<ProcessedResponse>(async (resolve, reject) => {
    let answer = "";
    let conversationId: string | undefined;
    let totalTokens: number | undefined;

    try {
      await processDifyStream(reader, {
        onMessage: (message) => {
          answer += message;
        },
        onMessageEnd: async ({ totalTokens: tokens, conversationId: id }) => {
          totalTokens = tokens;
          conversationId = id;
        },
        onDone: () => {
          resolve({ answer, conversationId, totalTokens });
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const createChatMessage = createAction({
  auth,
  name: "Create Chat Message",
  options: option
    .object({
      response_mode: option.enum(["streaming", "blocking"]).layout({
        label: "Response Mode",
        placeholder: "Method of response to be used",
        inputType: "variableDropdown",
        isRequired: true,
        defaultValue: "streaming",
      }),
      query: option.string.layout({
        label: "Query",
        placeholder: "User input/question content",
        inputType: "textarea",
        isRequired: true,
      }),

      conversationVariableId: option.string.layout({
        label: "Conversation ID",
        moreInfoTooltip:
          "Used to remember the conversation with the user. If empty, a new conversation ID is created.",
        inputType: "variableDropdown",
      }),
      user: option.string.layout({
        label: "User",
        moreInfoTooltip:
          "The user identifier, defined by the developer, must ensure uniqueness within the app.",
      }),
      inputs: option
        .array(
          option.object({
            key: option.string.layout({
              label: "Key",
            }),
            value: option.string.layout({
              label: "Value",
            }),
          }),
        )
        .layout({
          accordion: "Inputs",
        }),
      responseMapping: option
        .saveResponseArray(
          ["Answer", "Conversation ID", "Total Tokens"] as const,
          {
            item: {
              hiddenItems: ["Conversation ID"],
            },
          },
        )
        .layout({
          accordion: "Save response",
        }),
    })
    .merge(deprecatedCreateChatMessageOptions),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    stream: {
      getStreamVariableId: ({ responseMapping }) =>
        responseMapping?.find((r) => !r.item || r.item === "Answer")
          ?.variableId,
      run: async ({
        credentials: { apiEndpoint, apiKey },
        options: {
          response_mode,
          conversation_id,
          conversationVariableId,
          query,
          user,
          inputs,
          responseMapping,
        },
        variables,
      }) => {
        if (response_mode !== "streaming") {
          return {
            error: {
              description:
                "Stream handler only supports streaming mode. Use server handler for blocking mode.",
            },
          };
        }

        const existingDifyConversationId = conversationVariableId
          ? variables.get(conversationVariableId)
          : conversation_id;
        try {
          const response = await buildDifyRequest({
            apiEndpoint,
            apiKey,
            query,
            response_mode,
            existingDifyConversationId,
            user,
            inputs,
          });

          const reader = response.body?.getReader();

          if (!reader)
            return {
              httpError: {
                status: 500,
                message: "Could not get reader from Dify response",
              },
            };

          return {
            stream: new ReadableStream({
              async start(controller) {
                try {
                  await processDifyStream(reader, {
                    onDone: () => {
                      controller.close();
                    },
                    onMessage: (message) => {
                      controller.enqueue(
                        new TextEncoder().encode(
                          formatDataStreamPart("text", message),
                        ),
                      );
                    },
                    async onMessageEnd({ totalTokens, conversationId }) {
                      if (
                        conversationVariableId &&
                        isNotEmpty(conversationId) &&
                        isEmpty(existingDifyConversationId?.toString())
                      )
                        await variables.set([
                          { id: conversationVariableId, value: conversationId },
                        ]);

                      if ((responseMapping?.length ?? 0) === 0) return;
                      for (const mapping of responseMapping ?? []) {
                        if (!mapping.variableId) continue;

                        if (
                          mapping.item === "Conversation ID" &&
                          isNotEmpty(conversationId) &&
                          isEmpty(existingDifyConversationId?.toString())
                        )
                          await variables.set([
                            { id: mapping.variableId, value: conversationId },
                          ]);

                        if (mapping.item === "Total Tokens")
                          await variables.set([
                            { id: mapping.variableId, value: totalTokens },
                          ]);
                      }
                    },
                  });
                } catch (e) {
                  console.error(e);
                  controller.error(e); // Properly closing the stream with an error
                }
              },
            }),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({
              err,
              context: "While streaming Dify chat message",
            }),
          };
        }
      },
    },
    server: async ({
      credentials: { apiEndpoint, apiKey },
      options: {
        response_mode,
        conversationVariableId,
        conversation_id,
        query,
        user,
        inputs,
        responseMapping,
      },
      variables,
      logs,
    }) => {
      const existingDifyConversationId = conversationVariableId
        ? variables.get(conversationVariableId)
        : conversation_id;
      try {
        const response = await buildDifyRequest({
          apiEndpoint,
          apiKey,
          query,
          response_mode,
          existingDifyConversationId,
          user,
          inputs,
        });

        const processedResponse =
          response_mode === "blocking"
            ? await handleBlockingResponse(response)
            : await handleStreamingResponse(response);

        setResponseVariables({
          variables,
          responseMapping,
          answer: processedResponse.answer,
          conversationId: processedResponse.conversationId,
          totalTokens: processedResponse.totalTokens,
          conversationVariableId,
          existingDifyConversationId,
        });
      } catch (err) {
        return logs.add(
          await parseUnknownError({
            err,
            context: "While creating Dify chat message",
          }),
        );
      }
    },
  },
});

const convertNonMarkdownLinks = (text: string) => {
  const nonMarkdownLinks = /(?<![\([])https?:\/\/\S+/g;
  return text.replace(nonMarkdownLinks, (match) => `[${match}](${match})`);
};

const processDifyStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks: {
    onDone: () => void;
    onMessage: (message: string) => void;
    onMessageEnd?: ({
      totalTokens,
      conversationId,
    }: {
      totalTokens?: number;
      conversationId: string;
    }) => Promise<void>;
  },
) => {
  let jsonChunk = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      callbacks.onDone();
      return;
    }

    const chunk = new TextDecoder().decode(value);

    const lines = chunk.toString().split("\n") as string[];
    for (const line of lines.filter(
      (line) => line.length > 0 && line !== "\n",
    )) {
      jsonChunk += line;
      if (jsonChunk.startsWith("event: ")) {
        jsonChunk = "";
        continue;
      }
      if (!jsonChunk.startsWith("data: ") || !jsonChunk.endsWith("}")) continue;

      const data = JSON.parse(jsonChunk.slice(6)) as Chunk;
      jsonChunk = "";
      if (data.event === "message" || data.event === "agent_message") {
        callbacks.onMessage(data.answer);
      }
      if (data.event === "message_end") {
        await callbacks.onMessageEnd?.({
          totalTokens: data.metadata.usage?.total_tokens,
          conversationId: data.conversation_id,
        });
      }
    }
  }
};
