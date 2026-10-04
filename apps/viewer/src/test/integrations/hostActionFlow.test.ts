import { expect, it, mock } from "bun:test";
import { runWithHostExecutionContext } from "@typebot.io/runtime-session-store/hostExecutionContext";

process.env.SKIP_ENV_CHECK = "true";
mock.module("isolated-vm", () => ({
  default: {},
  Isolate: class {},
  Context: class {},
  Reference: class {},
}));
mock.module("@typebot.io/prisma", () => ({ default: {} }));

const { walkFlowForward } = await import(
  "@typebot.io/bot-engine/walkFlowForward"
);
const originalFetch = globalThis.fetch;

it("walks text, registered Forge action, text and keeps context outside state", async () => {
  process.env.HOST_API_BASE_URL = "http://localhost:1234";
  process.env.HOST_SERVICE_AUTH_KEY = "host-service-secret";
  const signedContext = "synthetic-signed-context-user-a";
  globalThis.fetch = (async (_url, init) => {
    expect(
      (init?.headers as Record<string, string>)["x-host-execution-context"],
    ).toBe(signedContext);
    return Response.json({ kind: "TEXT", text: "diagnostic-user-a" });
  }) as typeof fetch;
  try {
    const group = {
      id: "group-a",
      blocks: [
        {
          id: "before",
          type: "text",
          content: {
            richText: [{ type: "p", children: [{ text: "before" }] }],
          },
        },
        {
          id: "action",
          type: "host-action",
          options: {
            action: "Execute Action",
            actionKey: "example.echo",
            inputs: [],
            outputVariableId: "diagnostic",
          },
        },
        {
          id: "after",
          type: "text",
          content: { richText: [{ type: "p", children: [{ text: "after" }] }] },
        },
      ],
    };
    const state = {
      version: "3",
      workspaceId: "workspace-a",
      typebotsQueue: [
        {
          answers: [],
          resultId: "result-a",
          typebot: {
            version: "6.1",
            id: "typebot-a",
            groups: [group],
            events: [],
            edges: [],
            variables: [{ id: "diagnostic", name: "diagnostic" }],
          },
        },
      ],
    };
    const result = await runWithHostExecutionContext(
      {
        signedContext,
        envelope: {
          version: 1,
          iss: "example-host",
          aud: "botflow-host-action",
          flowId: "flow-a",
          executionId: "execution-a",
          iat: 1,
          exp: 2,
          claims: {},
        },
      },
      () =>
        walkFlowForward({ type: "group", group } as never, {
          version: 2,
          state: state as never,
          sessionStore: {} as never,
          setVariableHistory: [],
          textBubbleContentFormat: "markdown",
        }),
    );
    expect(result.messages).toHaveLength(2);
    expect(
      result.newSessionState.typebotsQueue[0].typebot.variables[0].value,
    ).toBe("diagnostic-user-a");
    const serialized = JSON.stringify({
      state: result.newSessionState,
      messages: result.messages,
      logs: result.logs,
    });
    expect(serialized).not.toContain(signedContext);
    expect(serialized).not.toContain("action-service-secret");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

it("denies the same Forge action on a public execution without trusted context", async () => {
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    throw new Error("unexpected outbound call");
  }) as typeof fetch;
  try {
    const group = {
      id: "group-public",
      blocks: [
        {
          id: "action-public",
          type: "host-action",
          options: {
            action: "Execute Action",
            actionKey: "example.echo",
            inputs: [],
          },
        },
      ],
    };
    const state = {
      version: "3",
      workspaceId: "workspace-a",
      typebotsQueue: [
        {
          answers: [],
          resultId: "result-public",
          typebot: {
            version: "6.1",
            id: "typebot-a",
            groups: [group],
            events: [],
            edges: [],
            variables: [],
          },
        },
      ],
    };
    await expect(
      walkFlowForward({ type: "group", group } as never, {
        version: 2,
        state: state as never,
        sessionStore: {} as never,
        setVariableHistory: [],
        textBubbleContentFormat: "markdown",
      }),
    ).rejects.toThrow("Host action unavailable");
    expect(called).toBe(false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
