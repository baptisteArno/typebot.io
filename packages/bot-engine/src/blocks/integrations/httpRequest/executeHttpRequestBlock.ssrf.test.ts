import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HttpMethod } from "@typebot.io/blocks-integrations/httpRequest/constants";
import { createPinnedDispatcher } from "@typebot.io/lib/ky";
import { getSafeDispatcher } from "@typebot.io/lib/ssrf/createSafeDispatcher";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { Dispatcher, ProxyAgent } from "undici";
import {
  executeHttpRequest,
  parseHttpRequestAttributes,
  webhookErrorDescription,
} from "./executeHttpRequestBlock";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

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

describe("executeHttpRequest SSRF protection", () => {
  beforeEach(() => {
    console.error = () => {};
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  it("blocks a redirect to a private destination", async () => {
    let fetchCallCount = 0;
    let redirectBodyWasCancelled = false;
    replaceFetch(async () => {
      fetchCallCount++;
      return new Response(
        new ReadableStream({
          cancel() {
            redirectBodyWasCancelled = true;
          },
        }),
        {
          status: 307,
          headers: { location: "http://127.0.0.1/internal" },
        },
      );
    });

    const result = await executeHttpRequest({
      url: "http://93.184.216.34/redirect",
      method: HttpMethod.POST,
      headers: {},
      isJson: false,
    });

    expect(fetchCallCount).toBe(1);
    expect(redirectBodyWasCancelled).toBe(true);
    expect(result.response.statusCode).toBe(500);
    expect(result.logs?.[0]?.description).toBe(webhookErrorDescription);
  });

  it("preserves the request through a safe 307 redirect", async () => {
    let fetchCallCount = 0;
    let redirectedMethod: string | undefined;
    let redirectedHeaders: Headers | undefined;
    let redirectedBody: string | undefined;
    replaceFetch(async (_input, init) => {
      fetchCallCount++;
      if (fetchCallCount === 1)
        return new Response(null, {
          status: 307,
          headers: { location: "http://93.184.216.34/target" },
        });
      redirectedMethod = init?.method;
      redirectedHeaders = new Headers(init?.headers);
      redirectedBody = init?.body
        ? await new Response(init.body).text()
        : undefined;
      return new Response("ok");
    });

    const result = await executeHttpRequest({
      url: "http://93.184.216.34/redirect",
      method: HttpMethod.POST,
      headers: {
        "Content-Type": "text/plain",
        "X-Regression": "preserved",
      },
      body: "payload",
      isJson: false,
    });

    expect(result.response.statusCode).toBe(200);
    expect(fetchCallCount).toBe(2);
    expect(redirectedMethod).toBe("POST");
    expect(redirectedHeaders?.get("x-regression")).toBe("preserved");
    expect(redirectedHeaders?.has("transfer-encoding")).toBe(false);
    expect(redirectedBody).toBe("payload");
  });

  it("uses the DNS-validating dispatcher on direct requests", async () => {
    let fetchInit: RequestInit | undefined;
    replaceFetch(async (_input, init) => {
      fetchInit = init;
      return new Response("ok");
    });

    const result = await executeHttpRequest({
      url: "http://93.184.216.34/resource",
      method: HttpMethod.POST,
      headers: {},
      isJson: false,
    });

    expect(result.response.statusCode).toBe(200);
    expect(fetchInit?.redirect).toBe("manual");
    expect(
      fetchInit && "dispatcher" in fetchInit ? fetchInit.dispatcher : undefined,
    ).toBe(getSafeDispatcher());
  });

  it("keeps redirect validation when a proxy is configured", async () => {
    let fetchCallCount = 0;
    let fetchInit: RequestInit | undefined;
    replaceFetch(async (_input, init) => {
      fetchCallCount++;
      fetchInit = init;
      return new Response(null, {
        status: 307,
        headers: { location: "http://169.254.169.254/latest/meta-data" },
      });
    });

    const result = await executeHttpRequest({
      url: "http://93.184.216.34/redirect",
      method: HttpMethod.POST,
      headers: {},
      isJson: false,
      proxyUrl: "http://proxy.example:8080",
    });

    expect(fetchCallCount).toBe(1);
    expect(result.response.statusCode).toBe(500);
    expect(fetchInit?.redirect).toBe("manual");
    expect(
      fetchInit && "dispatcher" in fetchInit ? fetchInit.dispatcher : undefined,
    ).toBeInstanceOf(ProxyAgent);
  });

  it("pins proxy requests to the address that passed validation", () => {
    const recordingDispatcher = new RecordingDispatcher();
    const dispatcher = createPinnedDispatcher(recordingDispatcher, {
      url: new URL("https://public.example:8443/resource"),
      hostname: "public.example",
      resolvedAddress: "93.184.216.34",
    });

    dispatcher.dispatch(
      {
        origin: "https://public.example:8443",
        path: "/resource",
        method: "GET",
        headers: ["x-regression", "preserved"],
      },
      {},
    );

    expect(recordingDispatcher.options?.origin?.toString()).toBe(
      "https://93.184.216.34:8443",
    );
    expect(recordingDispatcher.options?.headers).toEqual([
      "x-regression",
      "preserved",
      "host",
      "public.example:8443",
    ]);
    expect(
      recordingDispatcher.options && "servername" in recordingDispatcher.options
        ? recordingDispatcher.options.servername
        : undefined,
    ).toBe("public.example");
  });

  it("pins proxy requests when Node provides object-form headers", () => {
    const recordingDispatcher = new RecordingDispatcher();
    createPinnedDispatcher(recordingDispatcher, {
      url: new URL("http://public.example:8080/resource"),
      hostname: "public.example",
      resolvedAddress: "93.184.216.34",
    }).dispatch(
      {
        origin: "http://public.example:8080",
        path: "/resource",
        method: "GET",
        headers: { "x-regression": "preserved", host: "attacker.example" },
      },
      {},
    );

    expect(recordingDispatcher.options?.headers).toEqual({
      "x-regression": "preserved",
      host: "public.example:8080",
    });
  });

  it("sends legacy basic auth credentials after resolving variables", async () => {
    let fetchInit: RequestInit | undefined;
    replaceFetch(async (_input, init) => {
      fetchInit = init;
      return new Response("ok");
    });
    const httpRequest = {
      url: "http://93.184.216.34/resource",
      method: HttpMethod.GET,
      headers: [
        {
          id: "authorization",
          key: "Authorization",
          value: "Basic {{Username}}:{{Password}}",
        },
      ],
    };

    const parsedHttpRequest = await parseHttpRequestAttributes({
      httpRequest,
      variables: [
        { id: "username", name: "Username", value: "alice" },
        { id: "password", name: "Password", value: "s:ecret" },
      ],
      answers: [],
      sessionStore: new SessionStore(),
    });
    if (!parsedHttpRequest) throw new Error("Expected a parsed HTTP request.");
    const result = await executeHttpRequest(parsedHttpRequest);

    expect(result.response.statusCode).toBe(200);
    expect(new Headers(fetchInit?.headers).get("authorization")).toBe(
      `Basic ${Buffer.from("alice:s:ecret").toString("base64")}`,
    );
    expect(httpRequest.headers[0].value).toBe(
      "Basic {{Username}}:{{Password}}",
    );
  });
});

class RecordingDispatcher extends Dispatcher {
  options: Dispatcher.DispatchOptions | undefined;

  override dispatch(
    options: Dispatcher.DispatchOptions,
    _handler: Dispatcher.DispatchHandler,
  ) {
    this.options = options;
    return true;
  }
}
