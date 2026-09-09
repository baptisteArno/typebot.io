import { call } from "@orpc/server";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { CollaborationType, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleExecuteWebhook } from "./handleExecuteWebhook";
import { webhookRouter } from "./router";

const mocks = vi.hoisted(() => ({
  findTypebot: vi.fn(),
  findResult: vi.fn(),
  getSession: vi.fn(),
  sendWeb: vi.fn(),
  resumeWhatsApp: vi.fn(),
}));

vi.mock("@typebot.io/env", () => ({
  env: {
    NEXT_PUBLIC_PARTYKIT_HOST: "localhost:1999",
    ADMIN_EMAIL: ["admin@example.com"],
  },
}));
vi.mock("@sentry/nextjs", () => ({
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));
vi.mock("@typebot.io/prisma", () => ({
  default: {
    typebot: { findUnique: mocks.findTypebot },
    result: { findFirst: mocks.findResult },
  },
}));
vi.mock("@typebot.io/chat-session/queries/getSession", () => ({
  getSession: mocks.getSession,
}));
vi.mock("partysocket", () => ({ default: { fetch: mocks.sendWeb } }));
vi.mock("@typebot.io/whatsapp/resumeWhatsAppFlow", () => ({
  resumeWhatsAppFlow: mocks.resumeWhatsApp,
}));

const user = { id: "caller", email: "caller@example.com" };
const input = {
  params: { typebotId: "bot", blockId: "webhook", resultId: "result" },
  body: { answer: "accepted" },
};

const createTypebot = () => ({
  version: "6",
  settings: { publicShare: { isEnabled: true } },
  groups: [
    {
      id: "group",
      title: "Webhook",
      graphCoordinates: { x: 0, y: 0 },
      blocks: [{ id: "webhook", type: LogicBlockType.WEBHOOK }],
    },
  ],
  whatsAppCredentialsId: "credentials",
  workspace: {
    id: "workspace",
    isSuspended: false,
    isPastDue: false,
    members: [] as Pick<Prisma.MemberInWorkspace, "userId" | "role">[],
  },
  collaborators: [] as Pick<
    Prisma.CollaboratorsOnTypebots,
    "userId" | "type"
  >[],
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findResult.mockResolvedValue({ lastChatSessionId: "session" });
  mocks.getSession.mockResolvedValue({ id: "session", state: {} });
  mocks.sendWeb.mockResolvedValue(new Response());
  mocks.resumeWhatsApp.mockResolvedValue(undefined);
});

it("requires authentication at the production procedure", async () => {
  const logError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    await expect(
      call(webhookRouter.executeWebhookProcedure, input, {
        context: {
          apiOrigin: "http://localhost:3001",
          origin: undefined,
          iframeReferrerOrigin: undefined,
          authenticate: async () => null,
        },
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED", status: 401 });
    expect(mocks.findTypebot).not.toHaveBeenCalled();
    expect(mocks.sendWeb).not.toHaveBeenCalled();
    expect(mocks.resumeWhatsApp).not.toHaveBeenCalled();
  } finally {
    logError.mockRestore();
  }
});

describe.each([true, false])("public sharing enabled: %s", (isPublic) => {
  it.each([
    "outsider",
    "guest",
    "reader",
    "other-user",
    "admin",
  ])("rejects %s before looking up or resuming a session", async (role) => {
    const typebot = createTypebot();
    typebot.settings.publicShare.isEnabled = isPublic;
    if (role === "guest")
      typebot.workspace.members = [
        { userId: user.id, role: WorkspaceRole.GUEST },
      ];
    if (role === "reader")
      typebot.collaborators = [
        { userId: user.id, type: CollaborationType.READ },
      ];
    if (role === "other-user") {
      typebot.workspace.members = [
        { userId: "other", role: WorkspaceRole.ADMIN },
      ];
      typebot.collaborators = [
        { userId: "other", type: CollaborationType.WRITE },
      ];
    }
    mocks.findTypebot.mockResolvedValue(typebot);

    await expect(
      handleExecuteWebhook({
        input,
        context: {
          user:
            role === "admin" ? { ...user, email: "admin@example.com" } : user,
        },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    expect(mocks.findResult).not.toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.sendWeb).not.toHaveBeenCalled();
    expect(mocks.resumeWhatsApp).not.toHaveBeenCalled();
  });

  it.each([
    WorkspaceRole.ADMIN,
    WorkspaceRole.MEMBER,
    CollaborationType.WRITE,
    CollaborationType.FULL_ACCESS,
  ])("allows %s to resume web and WhatsApp flows", async (role) => {
    const typebot = createTypebot();
    typebot.settings.publicShare.isEnabled = isPublic;
    if (role === WorkspaceRole.ADMIN || role === WorkspaceRole.MEMBER)
      typebot.workspace.members = [{ userId: user.id, role }];
    else {
      typebot.workspace.members = [
        { userId: user.id, role: WorkspaceRole.GUEST },
      ];
      typebot.collaborators = [{ userId: user.id, type: role }];
    }
    mocks.findTypebot.mockResolvedValue(typebot);

    await expect(
      handleExecuteWebhook({ input, context: { user } }),
    ).resolves.toEqual({ message: "OK" });
    expect(mocks.findTypebot).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bot" },
        select: expect.objectContaining({
          collaborators: {
            where: { userId: user.id },
            select: { userId: true, type: true },
          },
        }),
      }),
    );
    expect(mocks.findResult).toHaveBeenCalledWith({
      where: { id: "result", typebotId: "bot" },
      select: { lastChatSessionId: true },
    });
    expect(mocks.getSession).toHaveBeenCalledWith("session");
    expect(mocks.sendWeb).toHaveBeenCalledExactlyOnceWith(
      { host: "localhost:1999", room: "result/webhooks" },
      { method: "POST", body: JSON.stringify(input.body, null, 2) },
    );
    expect(mocks.resumeWhatsApp).not.toHaveBeenCalled();

    mocks.sendWeb.mockClear();
    mocks.getSession.mockResolvedValue({
      id: "wa-phone-33600000000",
      state: { whatsApp: {} },
    });
    await expect(
      handleExecuteWebhook({ input, context: { user } }),
    ).resolves.toEqual({ message: "OK" });
    expect(mocks.sendWeb).not.toHaveBeenCalled();
    expect(mocks.resumeWhatsApp).toHaveBeenCalledExactlyOnceWith({
      receivedMessages: [
        {
          from: "33600000000",
          timestamp: expect.any(String),
          type: "webhook",
          webhook: { data: JSON.stringify({ data: input.body }, null, 2) },
        },
      ],
      workspaceId: "workspace",
      sessionId: "wa-phone-33600000000",
      credentialsId: "credentials",
      callFrom: "webhook",
    });
  });

  it.each([
    "suspended",
    "past-due",
  ])("rejects a %s workspace even for writers", async (status) => {
    const typebot = createTypebot();
    typebot.settings.publicShare.isEnabled = isPublic;
    typebot.workspace.members = [
      { userId: user.id, role: WorkspaceRole.ADMIN },
    ];
    typebot.workspace.isSuspended = status === "suspended";
    typebot.workspace.isPastDue = status === "past-due";
    mocks.findTypebot.mockResolvedValue(typebot);
    await expect(
      handleExecuteWebhook({ input, context: { user } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(mocks.findResult).not.toHaveBeenCalled();
    expect(mocks.sendWeb).not.toHaveBeenCalled();
    expect(mocks.resumeWhatsApp).not.toHaveBeenCalled();
  });
});

it.each([
  null,
  { lastChatSessionId: null },
])("rejects a missing, unrelated or sessionless result: %j", async (result) => {
  const typebot = createTypebot();
  typebot.workspace.members = [{ userId: user.id, role: WorkspaceRole.MEMBER }];
  mocks.findTypebot.mockResolvedValue(typebot);
  mocks.findResult.mockImplementation(async ({ where }) =>
    where.id === input.params.resultId &&
    where.typebotId === input.params.typebotId
      ? result
      : { lastChatSessionId: "unrelated-session" },
  );
  await expect(
    handleExecuteWebhook({ input, context: { user } }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(mocks.getSession).not.toHaveBeenCalled();
  expect(mocks.sendWeb).not.toHaveBeenCalled();
  expect(mocks.resumeWhatsApp).not.toHaveBeenCalled();
});

it("preserves public reads for anonymous users and non-members", async () => {
  const typebot = createTypebot();
  await expect(isReadTypebotForbidden(typebot)).resolves.toBe(false);
  await expect(isReadTypebotForbidden(typebot, user)).resolves.toBe(false);
  typebot.settings.publicShare.isEnabled = false;
  await expect(isReadTypebotForbidden(typebot)).resolves.toBe(true);
  await expect(isReadTypebotForbidden(typebot, user)).resolves.toBe(true);
});
