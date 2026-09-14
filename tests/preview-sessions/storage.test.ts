import { afterAll, expect, test } from "bun:test";
import {
  continueChatInputSchema,
  handleContinueChat,
  handleSendMessageV1,
  handleSendMessageV2,
  handleStartChatPreview,
  handleStartTemplatePreviewChat,
  JsonNull,
  prisma,
  saveStateToDatabase,
  startPreviewChatInputSchema,
  startTemplatePreviewChatInputSchema,
  state,
} from "./fixture";

const prefix = `preview-regression-${crypto.randomUUID()}`;
const createdIds = new Set<string>();
const context = { user: { id: "synthetic-attacker" } };
const savePreview = (id: string) =>
  saveStateToDatabase({
    sessionId: { type: "newPreview", id },
    session: { state },
    input: undefined,
    logs: undefined,
    clientSideActions: undefined,
    visitedEdges: [],
    setVariableHistory: [],
  });
const track = <T extends { sessionId?: string }>(reply: T) => {
  if (reply.sessionId) createdIds.add(reply.sessionId);
  return reply;
};

afterAll(async () => {
  await prisma.chatSession.deleteMany({
    where: { id: { in: [...createdIds] } },
  });
  await prisma.$disconnect();
});

for (const victim of [
  "live",
  "whatsapp",
  "other-user-preview",
  "other-bot-preview",
  "own-preview",
]) {
  test(`normal/template registration and concurrent restarts preserve ${victim}`, async () => {
    const id = `${prefix}-${victim}`;
    createdIds.add(id);
    const before = await prisma.chatSession.create({
      data: {
        id,
        isReplying: true,
        state: {
          ...state,
          workspaceId:
            victim === "own-preview" ? state.workspaceId : `victim-${victim}`,
          typebotsQueue: [
            {
              ...state.typebotsQueue[0],
              typebot: {
                ...state.typebotsQueue[0].typebot,
                id:
                  victim === "own-preview" || victim === "other-user-preview"
                    ? "synthetic-attacker-bot"
                    : `victim-bot-${victim}`,
              },
              ...(victim === "live" || victim === "whatsapp"
                ? { resultId: "victim-result" }
                : {}),
            },
          ],
          allowedOrigins: ["https://victim.invalid"],
          ...(victim === "whatsapp"
            ? {
                whatsApp: {
                  phoneNumberId: "synthetic",
                  contact: { phoneNumber: "000" },
                },
              }
            : {}),
          victimMarker: victim,
        },
      },
    });
    const replies = await Promise.all(
      Array.from({ length: 12 }, async (_, index) =>
        track(
          index % 2 === 0
            ? await handleStartChatPreview({
                input: startPreviewChatInputSchema.parse({
                  typebotId: "synthetic-attacker-bot",
                  sessionId: id,
                  isOnlyRegistering: index % 3 === 0,
                }),
                context,
              })
            : await handleStartTemplatePreviewChat({
                input: startTemplatePreviewChatInputSchema.parse({
                  templateSlug: "synthetic",
                  sessionId: id,
                  isOnlyRegistering: index % 3 === 0,
                }),
              }),
        ),
      ),
    );
    expect(
      await prisma.chatSession.findUniqueOrThrow({ where: { id } }),
    ).toEqual(before);
    expect(new Set(replies.map((reply) => reply.sessionId)).size).toBe(12);
    for (const reply of replies) {
      expect(reply.sessionId).not.toBe(id);
      expect(
        (
          await prisma.chatSession.findUniqueOrThrow({
            where: { id: reply.sessionId },
          })
        ).state,
      ).toMatchObject(state);
    }
    expect(
      await prisma.chatSession.findUniqueOrThrow({ where: { id } }),
    ).toEqual(before);
    // Even a server-generated collision must fail without updating the victim.
    await expect(savePreview(id)).rejects.toMatchObject({ code: "P2002" });
    expect(
      await prisma.chatSession.findUniqueOrThrow({ where: { id } }),
    ).toEqual(before);
  });
}

for (const handler of [handleSendMessageV1, handleSendMessageV2]) {
  for (const emptyState of ["missing", "null", "empty"]) {
    test(`${handler.name} preview creation preserves ${emptyState} legacy ID`, async () => {
      const id = `${prefix}-${handler.name}-${emptyState}`;
      createdIds.add(id);
      if (emptyState !== "missing")
        await prisma.chatSession.create({
          data: {
            id,
            state: emptyState === "null" ? JsonNull : {},
            isReplying: true,
          },
        });
      const before = await prisma.chatSession.findUnique({ where: { id } });
      for (const isOnlyRegistering of [false, true]) {
        const reply = track(
          await handler({
            input: {
              sessionId: id,
              startParams: {
                typebot: "synthetic-attacker-bot",
                isPreview: true,
                isOnlyRegistering,
              },
            },
            context,
          }),
        );
        expect(reply.sessionId).toBeString();
        expect(reply.sessionId).not.toBe(id);
      }
      expect(await prisma.chatSession.findUnique({ where: { id } })).toEqual(
        before,
      );
    });
  }
  test(`${handler.name} continues a preview using its returned ID`, async () => {
    const reply = track(
      await handleStartChatPreview({
        input: startPreviewChatInputSchema.parse({
          typebotId: "synthetic-attacker-bot",
        }),
        context,
      }),
    );
    await handler({
      input: { sessionId: reply.sessionId, message: "hello" },
      context,
    });
    expect(
      (
        await prisma.chatSession.findUniqueOrThrow({
          where: { id: reply.sessionId },
        })
      ).state,
    ).toMatchObject({
      workspaceId: state.workspaceId,
      previewMetadata: { answers: [{ blockId: "input", content: "hello" }] },
    });
  });
}

test("concurrent create-only writes cannot replace the winner", async () => {
  const id = `${prefix}-collision`;
  createdIds.add(id);
  const attempts = await Promise.allSettled(
    Array.from({ length: 10 }, () => savePreview(id)),
  );
  expect(
    attempts.filter((attempt) => attempt.status === "fulfilled"),
  ).toHaveLength(1);
  expect(
    attempts.filter((attempt) => attempt.status === "rejected"),
  ).toHaveLength(9);
  expect(
    (await prisma.chatSession.findUniqueOrThrow({ where: { id } })).state,
  ).toMatchObject(state);
});

test("modern preview accepts answers on the returned session ID", async () => {
  const reply = track(
    await handleStartChatPreview({
      input: startPreviewChatInputSchema.parse({
        typebotId: "synthetic-attacker-bot",
        sessionId: "ignored-new-custom-id",
      }),
      context,
    }),
  );
  expect(reply.input?.id).toBe("input");
  await handleContinueChat({
    input: continueChatInputSchema.parse({
      sessionId: reply.sessionId,
      message: { type: "text", text: "hello" },
    }),
    context: {},
  });
  expect(
    (
      await prisma.chatSession.findUniqueOrThrow({
        where: { id: reply.sessionId },
      })
    ).state,
  ).toMatchObject({
    previewMetadata: { answers: [{ blockId: "input", content: "hello" }] },
  });
});
