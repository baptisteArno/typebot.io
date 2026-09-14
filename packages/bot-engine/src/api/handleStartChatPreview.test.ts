import { expect, mock, test } from "bun:test";
import { startPreviewChatResponseSchema } from "@typebot.io/chat-api/schemas";

mock.module("../startSession", () => ({
  startSession: async () => ({
    typebot: { id: "bot-id", version: "6.1", theme: {}, settings: {} },
    messages: [],
    newSessionState: { typebotsQueue: [] },
  }),
}));
mock.module("@typebot.io/runtime-session-store", () => ({
  withSessionStore: async (_id: string, run: (store: object) => unknown) =>
    run({}),
}));
mock.module("../saveStateToDatabase", () => ({
  saveStateToDatabase: async ({
    sessionId,
  }: {
    sessionId: { id: string };
  }) => ({ id: sessionId.id }),
}));

const {
  handleStartChatPreview,
  handleStartTemplatePreviewChat,
  startPreviewChatInputSchema,
  startTemplatePreviewChatInputSchema,
} = await import("./handleStartChatPreview");

test("preview room follows the authenticated user while session IDs stay random", async () => {
  const owner = startPreviewChatResponseSchema.parse(
    await handleStartChatPreview({
      input: startPreviewChatInputSchema.parse({ typebotId: "bot-id" }),
      context: { user: { id: "owner-id" } },
    }),
  );
  const restarted = startPreviewChatResponseSchema.parse(
    await handleStartChatPreview({
      input: startPreviewChatInputSchema.parse({ typebotId: "bot-id" }),
      context: { user: { id: "owner-id" } },
    }),
  );
  const collaborator = startPreviewChatResponseSchema.parse(
    await handleStartChatPreview({
      input: startPreviewChatInputSchema.parse({
        typebotId: "bot-id",
        sessionId: "legacy-session",
      }),
      context: { user: { id: "collaborator-id" } },
    }),
  );
  expect(owner.previewWebhookRoom).toBe("owner-id/bot-id/webhooks");
  expect(restarted.previewWebhookRoom).toBe(owner.previewWebhookRoom);
  expect(restarted.sessionId).not.toBe(owner.sessionId);
  expect(owner.sessionId).not.toBe("bot-id-owner-id");
  expect(collaborator.previewWebhookRoom).toBe(
    "collaborator-id/bot-id/webhooks",
  );
  expect(collaborator.sessionId).toBe("legacy-session");
});

test("templates do not receive a user webhook channel", async () => {
  const response = startPreviewChatResponseSchema.parse(
    await handleStartTemplatePreviewChat({
      input: startTemplatePreviewChatInputSchema.parse({
        templateSlug: "template",
      }),
    }),
  );
  expect(response.previewWebhookRoom).toBeUndefined();
  expect(response.sessionId).toBeString();
});
