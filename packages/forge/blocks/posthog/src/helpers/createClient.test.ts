import { afterEach, describe, expect, it } from "bun:test";
import { getSafeDispatcher } from "@typebot.io/lib/ssrf/createSafeDispatcher";
import { createClient } from "./createClient";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createClient SSRF protection", () => {
  it("blocks private PostHog hosts before sending a request", async () => {
    let requestCount = 0;
    replaceFetch(async () => {
      requestCount++;
      return Response.json({});
    });
    const client = createClient("phc_test", "http://127.0.0.1:3000");

    await expect(
      client.fetch(`${client.host}/batch`, createRequestOptions()),
    ).rejects.toThrow("loopback addresses");
    expect(requestCount).toBe(0);
  });

  it("blocks redirects from a public PostHog host to a private target", async () => {
    const requestedUrls: string[] = [];
    replaceFetch(async (input) => {
      requestedUrls.push(getRequestUrl(input));
      return new Response(null, {
        status: 307,
        headers: { location: "http://169.254.169.254/latest/meta-data" },
      });
    });
    const client = createClient("phc_test", "http://93.184.216.34");

    await expect(
      client.fetch(`${client.host}/batch`, createRequestOptions()),
    ).rejects.toThrow("link-local addresses");
    expect(requestedUrls).toEqual(["http://93.184.216.34/batch"]);
  });

  it("uses the DNS-validating dispatcher for PostHog requests", async () => {
    const dispatchers: unknown[] = [];
    replaceFetch(async (_input, init) => {
      dispatchers.push(
        init && "dispatcher" in init ? init.dispatcher : undefined,
      );
      return Response.json({});
    });
    const client = createClient("phc_test", "http://93.184.216.34");

    await client.fetch(`${client.host}/batch`, createRequestOptions());

    expect(dispatchers).toEqual([getSafeDispatcher()]);
  });
});

const createRequestOptions = (): Parameters<
  ReturnType<typeof createClient>["fetch"]
>[1] => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{}",
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
