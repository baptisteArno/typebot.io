import { formatDataStreamPart } from "@ai-sdk/ui-utils";
import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import ky from "ky";
import { auth } from "../auth";
import { defaultBaseUrl } from "../constants";
import { deprecatedCreateChatMessageOptions } from "../deprecated";
import type { Chunk } from "../types";

export const createChatMessage = createAction({
  auth,
  name: "Create Chat Message",
  options: option
    .object({
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
          conversation_id,
          conversationVariableId,
          query,
          user,
          inputs,
          responseMapping,
        },
        variables,
      }) => {
        const existingDifyConversationId = conversationVariableId
          ? variables.get(conversationVariableId)
          : conversation_id;
        try {
          const response = await ky(
            (apiEndpoint ?? defaultBaseUrl) + "/v1/chat-messages",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs:
                  inputs?.reduce((acc, { key, value }) => {
                    if (isEmpty(key) || isEmpty(value)) return acc;
                    return {
                      ...acc,
                      [key]: value,
                    };
                  }, {}) ?? {},
                query,
                response_mode: "streaming",
                conversation_id: existingDifyConversationId,
                user,
                files: [],
                timeout: false,
              }),
            },
          );
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
        const response = await ky(
          (apiEndpoint ?? defaultBaseUrl) + "/v1/chat-messages",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs:
                inputs?.reduce((acc, { key, value }) => {
                  if (isEmpty(key) || isEmpty(value)) return acc;
                  return {
                    ...acc,
                    [key]: value,
                  };
                }, {}) ?? {},
              query,
              response_mode: "streaming",
              conversation_id: existingDifyConversationId,
              user,
              files: [],
              timeout: false,
            }),
          },
        );

        const reader = response.body?.getReader();

        if (!reader)
          return logs.add({
            status: "error",
            description: "Failed to read response stream",
          });

        const { answer, conversationId, totalTokens } = await new Promise<{
          answer: string;
          conversationId: string | undefined;
          totalTokens: number | undefined;
        }>(async (resolve, reject) => {
          let answer = "";
          let conversationId: string | undefined;
          let totalTokens: number | undefined;

          try {
            await processDifyStream(reader, {
              onMessage: (message) => {
                answer += message;
              },
              onMessageEnd: async ({
                totalTokens: tokens,
                conversationId: id,
              }) => {
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

        if (
          conversationVariableId &&
          isNotEmpty(conversationId) &&
          isEmpty(existingDifyConversationId?.toString())
        )
          variables.set([
            { id: conversationVariableId, value: conversationId },
          ]);

        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;

          const item = mapping.item ?? "Answer";
          if (item === "Answer")
            variables.set([
              {
                id: mapping.variableId,
                value: convertNonMarkdownLinks(answer),
              },
            ]);

          if (
            item === "Conversation ID" &&
            isNotEmpty(conversationId) &&
            isEmpty(existingDifyConversationId?.toString())
          )
            variables.set([{ id: mapping.variableId, value: conversationId }]);

          if (item === "Total Tokens")
            variables.set([{ id: mapping.variableId, value: totalTokens }]);
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
