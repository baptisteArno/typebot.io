import { expect, it, mock } from "bun:test";
import { createHmac } from "node:crypto";
import { getHostExecutionContext } from "@typebot.io/runtime-session-store/hostExecutionContext";
import { z } from "zod";
import { sessionBinding, verifyHostRequest } from "./trustedContext";

const seen: string[] = [];
let hasPersistedSession = true;
let publishedFlow: {
  id: string;
  typebotId: string;
  version: string | null;
  typebot: {
    isClosed: boolean;
    isArchived: boolean;
    workspace: { isSuspended: boolean };
  };
} | null = {
  id: "published-a",
  typebotId: "typebot-a",
  version: "6.1",
  typebot: {
    isClosed: false,
    isArchived: false,
    workspace: { isSuspended: false },
  },
};
let editableTypebot: {
  id: string;
  name: string;
  updatedAt: Date;
  isClosed: boolean;
  isArchived: boolean;
  workspace: { isSuspended: boolean };
  publishedTypebot: { version: string | null } | null;
} | null = {
  id: "draft-a",
  name: "Example Flow",
  updatedAt: new Date("2026-09-30T08:00:00.000Z"),
  isClosed: false,
  isArchived: false,
  workspace: { isSuspended: false },
  publishedTypebot: { version: "6.1" },
};
const typebotFindUnique = mock(async () => editableTypebot);
mock.module("@typebot.io/bot-engine/api/handleStartChat", () => ({
  startChatInputSchema: z
    .object({ publicId: z.string(), message: z.unknown().optional() })
    .passthrough(),
  handleStartChat: async () => {
    seen.push(getHostExecutionContext().signedContext);
    return {
      sessionId: "session-a",
      messages: [{ type: "text", content: "before" }],
    };
  },
}));
mock.module("@typebot.io/bot-engine/api/handleContinueChat", () => ({
  continueChatInputSchema: z
    .object({ sessionId: z.string(), message: z.unknown().optional() })
    .passthrough(),
  handleContinueChat: async () => {
    seen.push(getHostExecutionContext().signedContext);
    return { messages: [{ type: "text", content: "after" }] };
  },
}));
mock.module("@typebot.io/chat-session/queries/getSession", () => ({
  getSession: async () =>
    hasPersistedSession && {
      state: {
        publicTypebotId: "published-a",
        typebotsQueue: [{ typebot: { id: "typebot-a" } }],
      },
    },
}));
mock.module("@typebot.io/prisma", () => ({
  default: {
    publicTypebot: {
      findFirst: async () => publishedFlow,
    },
    typebot: {
      findUnique: typebotFindUnique,
    },
  },
}));

const { startHostChat, continueHostChat, verifyHostFlow, getHostFlowMetadata } =
  await import("./bridge");
const signingKey = "test-signing-key-with-at-least-32-bytes";
process.env.HOST_BRIDGE_SERVICE_KEY = "bridge-service-secret";
process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY = signingKey;
process.env.HOST_SESSION_BINDING_KEY =
  "test-binding-key-with-at-least-32-bytes";
const now = Math.floor(Date.now() / 1000);
const signed = (claims = { subject: "opaque-a" }) => {
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      iss: "example-host",
      aud: "botflow-host-action",
      flowId: "flow-a",
      executionId: "execution-a",
      iat: now,
      exp: now + 60,
      claims,
    }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", signingKey).update(payload).digest("base64url")}`;
};
const request = (binding?: string) =>
  new Request("http://localhost/api/internal/host/start", {
    method: "POST",
    headers: {
      "x-host-service-key": "bridge-service-secret",
      "x-host-execution-context": signed(),
      ...(binding ? { "x-host-session-binding": binding } : {}),
    },
    body: JSON.stringify({ flowId: "flow-a" }),
  });

const verificationRequest = (serviceKey = "bridge-service-secret") =>
  new Request("http://localhost/api/internal/host/flows/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-host-service-key": serviceKey,
    },
    body: JSON.stringify({ flowId: "flow-a" }),
  });

const metadataRequest = (serviceKey = "bridge-service-secret") =>
  new Request("http://localhost/api/internal/host/flows/metadata", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-host-service-key": serviceKey,
    },
    body: JSON.stringify({ flowId: "flow-a" }),
  });

it("verifies only published, open, available Host flows with service auth", async () => {
  const response = await verifyHostFlow(verificationRequest());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ flowId: "flow-a", valid: true });

  publishedFlow = null;
  expect((await verifyHostFlow(verificationRequest())).status).toBe(404);
  publishedFlow = {
    id: "published-a",
    typebotId: "typebot-a",
    version: "6.1",
    typebot: {
      isClosed: true,
      isArchived: false,
      workspace: { isSuspended: false },
    },
  };
  expect((await verifyHostFlow(verificationRequest())).status).toBe(404);
  expect((await verifyHostFlow(verificationRequest("wrong"))).status).toBe(401);
  publishedFlow = {
    id: "published-a",
    typebotId: "typebot-a",
    version: "6.1",
    typebot: {
      isClosed: false,
      isArchived: false,
      workspace: { isSuspended: false },
    },
  };
});

it("returns generic Flow metadata and the real editable ID without graph data", async () => {
  typebotFindUnique.mockClear();
  const response = await getHostFlowMetadata(metadataRequest());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    publicFlowId: "flow-a",
    editableFlowId: "draft-a",
    displayName: "Example Flow",
    status: "PUBLISHED",
    updatedAt: "2026-09-30T08:00:00.000Z",
  });
  expect(typebotFindUnique).toHaveBeenCalledWith({
    where: { publicId: "flow-a" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      isClosed: true,
      isArchived: true,
      workspace: { select: { isSuspended: true } },
      publishedTypebot: { select: { version: true } },
    },
  });

  editableTypebot = { ...editableTypebot!, publishedTypebot: null };
  expect(
    await (await getHostFlowMetadata(metadataRequest())).json(),
  ).toMatchObject({
    publicFlowId: "flow-a",
    editableFlowId: "draft-a",
    status: "UNPUBLISHED",
  });

  editableTypebot = null;
  expect((await getHostFlowMetadata(metadataRequest())).status).toBe(404);
  expect((await getHostFlowMetadata(metadataRequest("wrong"))).status).toBe(
    401,
  );
  editableTypebot = {
    id: "draft-a",
    name: "Example Flow",
    updatedAt: new Date("2026-09-30T08:00:00.000Z"),
    isClosed: false,
    isArchived: false,
    workspace: { isSuspended: false },
    publishedTypebot: { version: "6.1" },
  };
});

it("starts and continues with request-only context and an opaque session binding", async () => {
  const token = signed();
  const startResponse = await startHostChat(request());
  expect(startResponse.status).toBe(200);
  const start = await startResponse.json();
  expect(start.messages[0].content).toBe("before");
  expect(typeof start.sessionBinding).toBe("string");
  expect(JSON.stringify(start)).not.toContain(token);
  expect(JSON.stringify(start)).not.toContain("opaque-a");
  const nextResponse = await continueHostChat(
    request(start.sessionBinding),
    "session-a",
  );
  expect(nextResponse.status).toBe(200);
  expect((await nextResponse.json()).messages[0].content).toBe("after");
  expect(seen).toEqual([token, token]);
  expect(() => getHostExecutionContext()).toThrow();
});

it("rejects continuation without a matching session binding and never logs credentials", async () => {
  const error = console.error;
  const logged: unknown[] = [];
  console.error = (...args) => {
    logged.push(...args);
  };
  try {
    expect((await continueHostChat(request(), "session-a")).status).toBe(401);
    expect((await continueHostChat(request("wrong"), "session-a")).status).toBe(
      401,
    );
    expect(logged).toEqual([]);
  } finally {
    console.error = error;
  }
});

it("returns a controlled not-found for missing persisted Host sessions", async () => {
  hasPersistedSession = false;
  try {
    const validBinding = sessionBinding(
      "missing-session",
      verifyHostRequest(request()).envelope,
    );
    const response = await continueHostChat(
      request(validBinding),
      "missing-session",
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Host session unavailable",
    });
  } finally {
    hasPersistedSession = true;
  }
});
