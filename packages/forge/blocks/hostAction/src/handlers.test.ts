import { afterEach, expect, it } from "bun:test";
import { runWithHostExecutionContext } from "@typebot.io/runtime-session-store/hostExecutionContext";
import { hostActionHandler } from "./handlers";
import { hostActionBlockSchema } from "./schemas";

const originalFetch = globalThis.fetch;
const originalUrl = process.env.HOST_API_BASE_URL;
const originalKey = process.env.HOST_SERVICE_AUTH_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.HOST_API_BASE_URL = originalUrl;
  process.env.HOST_SERVICE_AUTH_KEY = originalKey;
});

const execute = (values: string[], logs: string[], isPreview = false) =>
  hostActionHandler.server!({
    credentials: undefined,
    options: {
      actionKey: "example.echo",
      inputs: [{ key: "name", value: "{{userName}}" }],
      outputVariableId: "result",
    },
    variables: {
      parse: (value: string) => value.replace("{{userName}}", "synthetic-user"),
      set: (items: { value: unknown }[]) => values.push(String(items[0].value)),
    },
    logs: { add: (entry: unknown) => logs.push(String(entry)) },
    isPreview,
  } as never);

const trusted = (signedContext: string) => ({
  signedContext,
  envelope: {
    version: 1 as const,
    iss: "example-host",
    aud: "botflow-host-action" as const,
    flowId: "flow-a",
    executionId: "execution-a",
    iat: 1,
    exp: 2,
    claims: {},
  },
});

it("registers a generic Host Action accepting arbitrary host action keys", () => {
  const block = {
    id: "action-a",
    type: "host-action",
    options: {
      action: "Execute Action",
      actionKey: "invoice.lookup",
      inputs: [{ key: "invoiceId", value: "{{id}}" }],
      outputVariableId: "result",
    },
  };
  expect(hostActionBlockSchema.safeParse(block).success).toBe(true);
});

it("fails closed on public execution without sending a request", async () => {
  let called = false;
  globalThis.fetch = Object.assign(
    async () => {
      called = true;
      throw new Error();
    },
    { preconnect: originalFetch.preconnect },
  );
  await expect(execute([], [])).rejects.toThrow("Host action unavailable");
  expect(called).toBe(false);
});

it("does not call the Host from Builder preview", async () => {
  let called = false;
  globalThis.fetch = Object.assign(
    async () => {
      called = true;
      throw new Error();
    },
    { preconnect: originalFetch.preconnect },
  );
  const logs: string[] = [];
  await execute([], logs, true);
  expect(called).toBe(false);
  expect(logs).toEqual([]);
});

it("calls the configured Host Action endpoint and stores only controlled output", async () => {
  process.env.HOST_API_BASE_URL = "http://localhost:1234";
  process.env.HOST_SERVICE_AUTH_KEY = "host-service-secret";
  const values: string[] = [];
  const logs: string[] = [];
  globalThis.fetch = (async (url, init) => {
    expect(String(url)).toBe(
      "http://localhost:1234/internal/host/actions/example.echo",
    );
    expect(init?.redirect).toBe("error");
    expect(init?.headers).toMatchObject({
      "x-host-service-key": "host-service-secret",
      "x-host-execution-context": "signed-host-context",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      inputs: { name: "synthetic-user" },
    });
    return Response.json({ kind: "TEXT", text: "controlled-result" });
  }) as typeof fetch;
  await runWithHostExecutionContext(trusted("signed-host-context"), () =>
    execute(values, logs),
  );
  expect(values).toEqual(["controlled-result"]);
  expect(logs).toEqual([]);
  expect(JSON.stringify({ values, logs })).not.toContain("signed-host-context");
  expect(JSON.stringify({ values, logs })).not.toContain("host-service-secret");
});

it("isolates concurrent Host contexts and logs only a generic failure", async () => {
  process.env.HOST_API_BASE_URL = "http://localhost:1234";
  process.env.HOST_SERVICE_AUTH_KEY = "host-service-secret";
  globalThis.fetch = (async (_url, init) => {
    const context = (init?.headers as Record<string, string>)[
      "x-host-execution-context"
    ];
    await new Promise((resolve) =>
      setTimeout(resolve, context === "signed-a" ? 10 : 1),
    );
    if (context === "signed-b") return new Response("denied", { status: 403 });
    return Response.json({ kind: "TEXT", text: "host-a" });
  }) as typeof fetch;
  const a: string[] = [];
  const b: string[] = [];
  const logs: string[] = [];
  const [first, second] = await Promise.allSettled([
    runWithHostExecutionContext(trusted("signed-a"), () => execute(a, [])),
    runWithHostExecutionContext(trusted("signed-b"), () => execute(b, logs)),
  ]);
  expect(first.status).toBe("fulfilled");
  expect(second.status).toBe("rejected");
  expect(a).toEqual(["host-a"]);
  expect(b).toEqual([]);
  expect(logs).toEqual(["Host action unavailable"]);
});
