import { describe, expect, it } from "bun:test";
import { safeFetch } from "./safeFetch";

describe("safeFetch", () => {
  it("preserves fetch request and response semantics", async () => {
    const originalFetch = globalThis.fetch;
    let requestCount = 0;
    let requestedMethod: string | undefined;
    let requestedAuthorization: string | null | undefined;
    let requestedBody: string | undefined;

    globalThis.fetch = Object.assign(
      async (
        _input: Parameters<typeof fetch>[0],
        init?: Parameters<typeof fetch>[1],
      ) => {
        requestCount++;
        requestedMethod = init?.method;
        requestedAuthorization = new Headers(init?.headers).get(
          "authorization",
        );
        requestedBody = init?.body
          ? await new Response(init.body).text()
          : undefined;
        return new Response("Upstream unavailable", { status: 503 });
      },
      { preconnect: () => undefined },
    );

    try {
      const response = await safeFetch(
        "https://93.184.216.34/v1/chat/completions",
        {
          method: "POST",
          headers: { authorization: "Bearer sk-test" },
          body: JSON.stringify({ model: "gpt-5" }),
        },
      );

      expect(requestCount).toBe(1);
      expect(requestedMethod).toBe("POST");
      expect(requestedAuthorization).toBe("Bearer sk-test");
      expect(requestedBody).toBe('{"model":"gpt-5"}');
      expect(response.status).toBe(503);
      expect(await response.text()).toBe("Upstream unavailable");
      expect(safeFetch.preconnect()).toBeUndefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
