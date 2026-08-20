import { describe, expect, it } from "bun:test";
import { createSafeOpenAIClient } from "./createSafeOpenAIClient";

describe("createSafeOpenAIClient", () => {
  it("blocks model and assistant fetchers from reaching private base URLs", async () => {
    let requestCount = 0;
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () => {
        requestCount++;
        return Response.json({ data: [] });
      },
    });
    const openai = createSafeOpenAIClient({
      apiKey: "sk-test",
      baseURL: `http://127.0.0.1:${server.port}/v1`,
      maxRetries: 0,
    });

    try {
      await expect(
        (async () => {
          await openai.models.list();
        })(),
      ).rejects.toThrow();
      await expect(
        (async () => {
          await openai.beta.assistants.list();
        })(),
      ).rejects.toThrow();

      expect(requestCount).toBe(0);
    } finally {
      server.stop();
    }
  });
});
