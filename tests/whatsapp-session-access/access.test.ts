import { beforeEach, expect, mock, test } from "bun:test";

// All persistence, engine execution and provider calls are synthetic. The public
// handlers and the internal WhatsApp resume orchestrator are imported unchanged.
const makeSession = (whatsApp: boolean, resultId: string | undefined) => ({
  id: "wa-109321812345678-33600000000",
  updatedAt: new Date(),
  isReplying: false,
  state: {
    currentBlockId: "block",
    whatsApp: whatsApp
      ? { contact: { name: "Synthetic contact", phoneNumber: "33600000000" } }
      : undefined,
    allowedOrigins: ["https://allowed.example"],
    expiryTimeout: 14400000,
    typebotsQueue: [
      { resultId, typebot: { id: "test-bot", groups: [], variables: [] } },
    ],
  },
});
let session: ReturnType<typeof makeSession> | null = makeSession(
  true,
  "result",
);
const continueFlow = mock(async () => ({
  messages: [],
  newSessionState: session?.state,
  visitedEdges: [],
  setVariableHistory: [],
}));
const saveState = mock(async () => ({ id: session?.id }));
const saveLogs = mock(async () => {});
const startSession = mock(async () => {
  throw new Error("Unexpected session creation");
});
const stream = mock(
  async () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("synthetic stream"));
        controller.close();
      },
    }),
);
const sendReply = mock(async () => ({}));
mock.module("@typebot.io/env", () => ({
  env: { NEXT_PUBLIC_VIEWER_URL: ["https://viewer.example"] },
}));
mock.module("@typebot.io/chat-session/queries/getSession", () => ({
  getSession: async () => session,
}));
mock.module("@typebot.io/chat-session/queries/upsertSession", () => ({
  upsertSession: async () => ({}),
}));
mock.module("@typebot.io/chat-session/queries/updateSession", () => ({
  updateSession: async () => ({}),
}));
mock.module("@typebot.io/chat-session/queries/restartSession", () => ({
  restartSession: startSession,
}));
mock.module("@typebot.io/runtime-session-store", () => ({
  withSessionStore: async (_id: string, run: (store: object) => unknown) =>
    run({}),
}));
mock.module("@typebot.io/bot-engine/continueBotFlow", () => ({
  continueBotFlow: continueFlow,
}));
mock.module("@typebot.io/bot-engine/saveStateToDatabase", () => ({
  saveStateToDatabase: saveState,
}));
mock.module("../../packages/bot-engine/src/startSession", () => ({
  startSession,
}));
mock.module("../../packages/bot-engine/src/queries/saveLogs", () => ({
  saveLogs,
}));
mock.module(
  "../../packages/bot-engine/src/queries/saveSetVariableHistoryItems",
  () => ({ saveSetVariableHistoryItems: async () => {} }),
);
mock.module("@typebot.io/credentials/getCredentials", () => ({
  getCredentials: async () => {
    throw new Error("Unexpected credentials lookup");
  },
}));
mock.module("@typebot.io/credentials/decryptV2", () => ({
  decryptV2: async () => ({}),
}));
mock.module("@typebot.io/credentials/decrypt", () => ({
  decrypt: async () => ({}),
}));
mock.module("@typebot.io/forge-repository/handlers", () => ({
  forgedBlockHandlers: {},
}));
mock.module("@typebot.io/legacy/getOpenAIChatCompletionStream", () => ({
  getOpenAIChatCompletionStream: stream,
}));
mock.module("@typebot.io/groups/helpers/getBlockById", () => ({
  getBlockById: () => ({
    group: { id: "group" },
    block: { id: "block", type: "OpenAI", options: {} },
  }),
}));
mock.module("@typebot.io/lib/redis", () => ({ default: undefined }));
mock.module(
  "../../packages/whatsapp/src/convertWhatsAppMessageToTypebotMessage",
  () => ({
    convertWhatsAppMessageToTypebotMessage: async () => ({
      type: "text",
      text: "test reply",
    }),
  }),
);
mock.module("../../packages/whatsapp/src/sendChatReplyToWhatsApp", () => ({
  sendChatReplyToWhatsApp: sendReply,
}));
mock.module("../../packages/whatsapp/src/sendWhatsAppTypingIndicator", () => ({
  sendWhatsAppTypingIndicator: async () => {},
}));
mock.module("../../packages/whatsapp/src/startWhatsAppSession", () => ({
  startWhatsAppSession: startSession,
}));

mock.module("../../packages/bot-engine/src/parseDynamicTheme", () => ({
  parseDynamicTheme: () => undefined,
}));
mock.module("@typebot.io/variables/deepParseVariables", () => ({
  deepParseVariables: (value: unknown) => value,
}));
mock.module("@typebot.io/variables/parseVariables", () => ({
  parseVariables: (value: string) => value,
}));
mock.module("../../packages/bot-engine/src/updateVariablesInSession", () => ({
  updateVariablesInSession: () => {
    throw new Error("Unexpected variable update");
  },
}));

const { handleContinueChat } = await import(
  "../../packages/bot-engine/src/api/handleContinueChat"
);
const { handleSaveClientLogs } = await import(
  "../../packages/bot-engine/src/api/handleSaveClientLogs"
);
const { handleSaveClientLogsV1 } = await import(
  "../../packages/bot-engine/src/api/legacy/handleSaveClientLogsV1"
);
const { handleSendMessageV1 } = await import(
  "../../packages/bot-engine/src/api/legacy/handleSendMessageV1"
);
const { handleSendMessageV2 } = await import(
  "../../packages/bot-engine/src/api/legacy/handleSendMessageV2"
);
const { getMessageStream } = await import(
  "../../packages/bot-engine/src/apiHandlers/getMessageStream"
);
const { resumeWhatsAppFlow } = await import(
  "../../packages/whatsapp/src/resumeWhatsAppFlow"
);

const handlers = [
  (sessionId: string, origin?: string) =>
    handleContinueChat({
      input: {
        sessionId,
        message: { type: "text", text: "injected" },
        textBubbleContentFormat: "richText",
      },
      context: { origin },
    }),
  ...[handleSendMessageV1, handleSendMessageV2].map(
    (handler) => (sessionId: string, origin?: string) =>
      handler({
        input: {
          sessionId,
          message: "injected",
          startParams: { typebot: "other-bot", isPreview: true },
          clientLogs: [],
        },
        context: { user: { id: "unrelated-user" }, origin },
      }),
  ),
  ...[handleSaveClientLogs, handleSaveClientLogsV1].map(
    (handler) => (sessionId: string, origin?: string) =>
      handler({
        input: {
          sessionId,
          clientLogs: [{ status: "error", description: "injected" }],
        },
        context: { origin },
      }),
  ),
];
beforeEach(() => {
  session = makeSession(true, "result");
  for (const effect of [
    continueFlow,
    saveState,
    saveLogs,
    startSession,
    stream,
    sendReply,
  ])
    effect.mockClear();
});

for (const origin of [
  undefined,
  "https://allowed.example",
  "https://attacker.example",
]) {
  for (const [index, handler] of handlers.entries()) {
    test(`public handler ${index} denies WhatsApp, origin=${origin}`, async () => {
      const before = structuredClone(session);
      await expect(handler(session!.id, origin)).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      expect(session).toEqual(before);
      for (const effect of [
        continueFlow,
        saveState,
        saveLogs,
        startSession,
        stream,
      ])
        expect(effect).not.toHaveBeenCalled();
    });
  }
}
test("stream denies WhatsApp before accessing block, credentials or provider", async () => {
  expect(
    await getMessageStream({ sessionId: session!.id, messages: [] }),
  ).toEqual({ status: 404, message: "Could not find session" });
  expect(stream).not.toHaveBeenCalled();
  expect(saveState).not.toHaveBeenCalled();
});
test("random IDs do not make WhatsApp sessions public", async () => {
  session!.id = "random-preview-session";
  for (const handler of handlers)
    await expect(handler(session!.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  expect(
    (await getMessageStream({ sessionId: session!.id, messages: undefined }))
      .status,
  ).toBe(404);
});
for (const resultId of ["result", undefined]) {
  test(`web continuation works without Origin, resultId=${resultId}`, async () => {
    session = makeSession(false, resultId);
    // Even a legacy web ID with wa- is governed by the persisted channel.
    for (const handler of handlers.slice(0, 3))
      await expect(handler(session.id)).resolves.toHaveProperty("messages");
    expect(continueFlow).toHaveBeenCalledTimes(3);
    expect(saveState).toHaveBeenCalledTimes(3);
  });
}
test("web client logs remain writable", async () => {
  session = makeSession(false, "result");
  for (const handler of handlers.slice(3))
    await expect(handler(session!.id)).resolves.toHaveProperty(
      "message",
      "Logs successfully saved.",
    );
  expect(saveLogs).toHaveBeenCalledTimes(2);
});
test("web allowed-origin policy still rejects an unrelated origin", async () => {
  session = makeSession(false, "result");
  for (const handler of handlers)
    await expect(
      handler(session!.id, "https://attacker.example"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect(continueFlow).not.toHaveBeenCalled();
});
for (const callFrom of [undefined, "webhook"] as const) {
  test(`internal WhatsApp continuation remains available, callFrom=${callFrom}`, async () => {
    await resumeWhatsAppFlow({
      sessionId: session!.id,
      credentialsData: {
        provider: "meta",
        phoneNumberId: "109321812345678",
        systemUserAccessToken: "synthetic-not-a-token",
      },
      phoneNumberId: "109321812345678",
      workspaceId: "test-workspace",
      credentialsId: "test-credentials",
      callFrom,
      receivedMessages: [
        {
          type: "text",
          text: { body: "test reply" },
          from: "33600000000",
          id: "test-message",
          timestamp: String(Math.floor(Date.now() / 1000)),
        },
      ],
    });
    expect(continueFlow).toHaveBeenCalledTimes(1);
    expect(saveState).toHaveBeenCalledTimes(1);
    expect(sendReply).toHaveBeenCalledTimes(1);
  });
}

for (const resultId of ["result", undefined]) {
  test(`web and preview streaming remains available, resultId=${resultId}`, async () => {
    session = makeSession(false, resultId);
    const response = await getMessageStream({
      sessionId: session.id,
      messages: [],
    });
    expect(response.stream).toBeDefined();
    expect(await new Response(response.stream).text()).toBe("synthetic stream");
    expect(stream).toHaveBeenCalledTimes(1);
  });
}
test("missing sessions remain unavailable", async () => {
  session = null;
  for (const handler of [handlers[0], ...handlers.slice(3)])
    await expect(handler("missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  expect(
    (await getMessageStream({ sessionId: "missing", messages: [] })).status,
  ).toBe(404);
});

test("viewer streaming route returns no stream for WhatsApp", async () => {
  const { POST } = await import(
    "../../apps/viewer/src/app/api/v2/sessions/[sessionId]/streamMessage/route"
  );
  const response = await POST(
    new Request("http://localhost/api/v2/sessions/test/streamMessage", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    }),
    { params: Promise.resolve({ sessionId: session!.id }) },
  );
  // Legacy viewer route encodes errors in JSON and retains HTTP 200.
  expect(await response.json()).toEqual({
    status: 404,
    message: "Could not find session",
  });
  expect(stream).not.toHaveBeenCalled();
});
