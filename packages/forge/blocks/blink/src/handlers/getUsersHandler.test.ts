import { afterEach, describe, expect, it } from "bun:test";
import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import { getUsersHandler } from "./getUsersHandler";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getUsersHandler", () => {
  it("lists every user page when no filter is set", async () => {
    const requestedUrls: string[] = [];
    globalThis.fetch = Object.assign(
      async (input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : input.toString();
        requestedUrls.push(url);
        const page = new URL(url).searchParams.get("page");
        return Response.json({
          data: page === "1" ? [{ id: "u-1" }, { id: "u-2" }] : [{ id: "u-3" }],
          meta: { has_more: page === "1" },
        });
      },
      { preconnect: originalFetch.preconnect },
    );
    const variables: { id: string; value: unknown }[] = [];

    await getUsersHandler.server?.({
      credentials: { apiKey: "legacy-token" },
      options: Object.assign(Object.create(null), {
        responseMapping: [{ item: "User IDs", variableId: "user-ids" }],
      }),
      variables: createVariablesStore(variables),
      logs: createLogsStore([]),
      sessionStore: Object.create(null),
    });

    expect(requestedUrls).toEqual([
      "https://api.joinblink.com/v2/user?page=1&limit=100",
      "https://api.joinblink.com/v2/user?page=2&limit=100",
    ]);
    expect(variables).toEqual([
      { id: "user-ids", value: ["u-1", "u-2", "u-3"] },
    ]);
  });

  it("does not list every user when a selected filter has no value", async () => {
    let requestCount = 0;
    globalThis.fetch = Object.assign(
      async () => {
        requestCount++;
        return Response.json({ data: [] });
      },
      { preconnect: originalFetch.preconnect },
    );
    const logs: unknown[] = [];

    await getUsersHandler.server?.({
      credentials: { apiKey: "legacy-token" },
      options: Object.assign(Object.create(null), {
        filter: { type: "User ID" },
      }),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(requestCount).toBe(0);
    expect(logs).toEqual(["No user ID provided in the filter."]);
  });

  it("asks for a legacy app token when given App Identity credentials", async () => {
    const logs: unknown[] = [];

    await getUsersHandler.server?.({
      credentials: { clientId: "aid-1", clientSecret: "client-secret" },
      options: Object.create(null),
      variables: createVariablesStore([]),
      logs: createLogsStore(logs),
      sessionStore: Object.create(null),
    });

    expect(logs).toEqual([
      "Get Users needs Blink credentials created from a Legacy app token.",
    ]);
  });
});

const createVariablesStore = (
  setVariables: { id: string; value: unknown }[],
): VariableStore => ({
  get: () => undefined,
  set: (variables) => {
    setVariables.push(...variables);
  },
  parse: (value) => value,
  list: () => [],
});

const createLogsStore = (logs: unknown[]): LogsStore => ({
  add: (log) => {
    logs.push(log);
  },
});
