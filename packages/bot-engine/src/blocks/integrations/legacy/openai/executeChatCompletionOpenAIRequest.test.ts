import { describe, expect, it } from "bun:test";
import { executeChatCompletionOpenAIRequest } from "./executeChatCompletionOpenAIRequest";

describe("executeChatCompletionOpenAIRequest", () => {
  it("blocks legacy runtime requests to private base URLs", async () => {
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
      const result = await executeChatCompletionOpenAIRequest({
        apiKey: "sk-test",
        baseUrl: `http://127.0.0.1:${server.port}/v1`,
        apiVersion: undefined,
        model: "gpt-5",
        messages: [{ role: "user", content: "Hello" }],
        temperature: undefined,
      });

      expect(requestCount).toBe(0);
      expect(result.logs).toEqual([
        {
          status: "error",
          description: "Internal error",
        },
      ]);
    } finally {
      server.stop();
    }
  });
});
