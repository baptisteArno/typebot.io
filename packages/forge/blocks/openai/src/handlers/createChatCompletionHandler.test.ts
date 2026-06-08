import { describe, expect, it } from "bun:test";
import { generateText } from "ai";
import { createOpenAIChatLanguageModel } from "./createOpenAIChatLanguageModel";

type OpenAIProviderFetch = NonNullable<
  Parameters<typeof createOpenAIChatLanguageModel>[0]["fetch"]
>;
type OpenAIProviderFetchInput = Parameters<OpenAIProviderFetch>[0];
type OpenAIProviderFetchInit = Parameters<OpenAIProviderFetch>[1];

describe("createOpenAIChatLanguageModel", () => {
  it("targets the chat completions endpoint", async () => {
    let requestedUrl: string | undefined;
    let requestedBody: unknown;

    const fetch: OpenAIProviderFetch = Object.assign(
      async (
        input: OpenAIProviderFetchInput,
        init?: OpenAIProviderFetchInit,
      ) => {
        requestedUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        if (typeof init?.body === "string")
          requestedBody = JSON.parse(init.body);

        return new Response(
          JSON.stringify({
            id: "chatcmpl-test",
            object: "chat.completion",
            created: 0,
            model: "agent_9ufXYw8-UBjnwj5uMWbnk",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "Bonjour !",
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 1,
              completion_tokens: 1,
              total_tokens: 2,
            },
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      },
      { preconnect: () => undefined },
    );

    await generateText({
      model: createOpenAIChatLanguageModel({
        apiKey: "sk-test",
        baseUrl: "https://example.com/api/agents/v1",
        modelName: "agent_9ufXYw8-UBjnwj5uMWbnk",
        fetch,
      }),
      messages: [{ role: "user", content: "Hello" }],
    });

    expect(requestedUrl).toBe(
      "https://example.com/api/agents/v1/chat/completions",
    );
    expect(requestedBody).toEqual({
      model: "agent_9ufXYw8-UBjnwj5uMWbnk",
      messages: [{ role: "user", content: "Hello" }],
    });
  });
});
