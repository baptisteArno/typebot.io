import { describe, expect, it } from "bun:test";
import { generateText } from "ai";
import { createLiteLLMChatLanguageModel } from "./createLiteLLMChatLanguageModel";

describe("createLiteLLMChatLanguageModel", () => {
  it("blocks runtime requests to private base URLs", async () => {
    let requestCount = 0;
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () => {
        requestCount++;
        return new Response("Unexpected request");
      },
    });

    try {
      await expect(
        generateText({
          model: createLiteLLMChatLanguageModel({
            apiKey: "sk-test",
            baseUrl: `http://127.0.0.1:${server.port}/v1`,
            modelName: "gpt-4o-mini",
          }),
          messages: [{ role: "user", content: "Hello" }],
        }),
      ).rejects.toThrow();

      expect(requestCount).toBe(0);
    } finally {
      server.stop();
    }
  });
});
