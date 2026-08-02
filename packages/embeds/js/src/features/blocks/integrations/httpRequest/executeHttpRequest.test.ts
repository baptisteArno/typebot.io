import { afterEach, describe, expect, it, mock } from "bun:test";
import type { ExecutableHttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { executeHttpRequest } from "./executeHttpRequest";

const baseRequest: ExecutableHttpRequest = {
  url: "https://example.com/api",
  method: "GET" as ExecutableHttpRequest["method"],
};

describe("executeHttpRequest", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockFetch = () => {
    const fetchMock = mock((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      } as Response),
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  };

  it("should not include credentials by default", async () => {
    const fetchMock = mockFetch();
    await executeHttpRequest(baseRequest, false);
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBeUndefined();
  });

  it("should include credentials when withCredentials is true", async () => {
    const fetchMock = mockFetch();
    await executeHttpRequest({ ...baseRequest, withCredentials: true }, false);
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include");
  });

  it("should omit credentials in preview even when withCredentials is true", async () => {
    const fetchMock = mockFetch();
    await executeHttpRequest({ ...baseRequest, withCredentials: true }, true);
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("omit");
  });
});
