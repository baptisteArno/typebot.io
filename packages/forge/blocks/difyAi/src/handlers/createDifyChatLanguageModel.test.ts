import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getSafeDispatcher } from "@typebot.io/lib/ssrf/createSafeDispatcher";
import { createDifyChatLanguageModel } from "./createDifyChatLanguageModel";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe("createDifyChatLanguageModel SSRF protection", () => {
  beforeEach(() => {
    console.error = () => {};
    console.warn = () => {};
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it("blocks blocking chat requests to private targets", async () => {
    let requestCount = 0;
    replaceFetch(async () => {
      requestCount++;
      return createBlockingResponse();
    });

    await expect(
      createDifyChatLanguageModel({
        apiEndpoint: "http://127.0.0.1:3000",
        apiKey: "app-test",
        responseMode: "blocking",
      }).doGenerate({
        prompt: [{ role: "user", content: [{ type: "text", text: "Hello" }] }],
      }),
    ).rejects.toThrow("loopback addresses");
    expect(requestCount).toBe(0);
  });

  it("blocks streaming chat redirects to private targets", async () => {
    const requestedUrls: string[] = [];
    replaceFetch(async (input) => {
      requestedUrls.push(getRequestUrl(input));
      return new Response(null, {
        status: 307,
        headers: { location: "http://127.0.0.1/internal" },
      });
    });

    await expect(
      createDifyChatLanguageModel({
        apiEndpoint: "http://93.184.216.34",
        apiKey: "app-test",
        responseMode: "streaming",
      }).doStream({
        prompt: [{ role: "user", content: [{ type: "text", text: "Hello" }] }],
      }),
    ).rejects.toThrow("loopback addresses");
    expect(requestedUrls).toEqual(["http://93.184.216.34/v1/chat-messages"]);
  });

  it("blocks file upload redirects before the private target is requested", async () => {
    const requestedUrls: string[] = [];
    replaceFetch(async (input, init) => {
      const url = getRequestUrl(input);
      requestedUrls.push(url);
      if (url === "http://93.184.216.34/v1/files/upload") {
        if (init?.redirect !== "manual")
          return globalThis.fetch("http://127.0.0.1/internal", init);
        return new Response(null, {
          status: 307,
          headers: { location: "http://127.0.0.1/internal" },
        });
      }
      if (url === "http://127.0.0.1/internal")
        return Response.json({ id: "unsafe-upload" });
      return createBlockingResponse();
    });

    const result = await createDifyChatLanguageModel({
      apiEndpoint: "http://93.184.216.34",
      apiKey: "app-test",
      responseMode: "blocking",
    }).doGenerate({
      prompt: [
        {
          role: "user",
          content: [
            { type: "text", text: "Read the attachment" },
            {
              type: "file",
              data: new Uint8Array([116, 101, 115, 116]),
              mediaType: "text/plain",
              filename: "test.txt",
            },
          ],
        },
      ],
    });

    expect(result.content).toEqual([{ type: "text", text: "Safe response" }]);
    expect(requestedUrls).toEqual([
      "http://93.184.216.34/v1/files/upload",
      "http://93.184.216.34/v1/chat-messages",
    ]);
  });

  it("uses the DNS-validating dispatcher for streaming chat and uploads", async () => {
    const requestedUrls: string[] = [];
    const dispatchers: unknown[] = [];
    replaceFetch(async (input, init) => {
      const url = getRequestUrl(input);
      requestedUrls.push(url);
      dispatchers.push(
        init && "dispatcher" in init ? init.dispatcher : undefined,
      );
      if (url.endsWith("/files/upload"))
        return Response.json({ id: "safe-upload" });
      return new Response(
        'data: {"event":"message_end","id":"message-id","conversation_id":"conversation-id","metadata":{"usage":{"prompt_tokens":1,"completion_tokens":1,"total_tokens":2}}}\n\n',
        { headers: { "content-type": "text/event-stream" } },
      );
    });

    const { stream } = await createDifyChatLanguageModel({
      apiEndpoint: "http://93.184.216.34",
      apiKey: "app-test",
      responseMode: "streaming",
    }).doStream({
      prompt: [
        {
          role: "user",
          content: [
            { type: "text", text: "Read the attachment" },
            {
              type: "file",
              data: new Uint8Array([116, 101, 115, 116]),
              mediaType: "text/plain",
              filename: "test.txt",
            },
          ],
        },
      ],
    });
    await stream.cancel();

    expect(requestedUrls).toEqual([
      "http://93.184.216.34/v1/files/upload",
      "http://93.184.216.34/v1/chat-messages",
    ]);
    expect(dispatchers).toEqual([getSafeDispatcher(), getSafeDispatcher()]);
  });
});

const replaceFetch = (
  implementation: (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ) => Promise<Response>,
) => {
  globalThis.fetch = Object.assign(implementation, {
    preconnect: originalFetch.preconnect,
  });
};

const getRequestUrl = (input: Parameters<typeof fetch>[0]) =>
  typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

const createBlockingResponse = () =>
  Response.json({
    id: "response-id",
    answer: "Safe response",
    task_id: "task-id",
    conversation_id: "conversation-id",
    message_id: "message-id",
    metadata: {
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    },
  });
