import { beforeEach, describe, expect, it, mock } from "bun:test";

const gentleRateLimit = mock();
const dailyGuestInvitationRateLimit = mock();
const typebotFindFirst = mock();
const userFindUnique = mock();
const invitationCreate = mock();
const invitationDeleteMany = mock();
const collaboratorsOnTypebotsCreate = mock();
const memberInWorkspaceUpsert = mock();
const sendGuestInvitationEmail = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME = "viewer-project";
process.env.VERCEL_TEAM_ID = "team-id";
process.env.VERCEL_TOKEN = "vercel-token";

mock.module("@typebot.io/auth/lib/gentleRateLimiter", () => ({
  default: { limit: gentleRateLimit },
}));

mock.module("@typebot.io/auth/lib/dailyGuestInvitationRateLimiter", () => ({
  default: { limit: dailyGuestInvitationRateLimit },
}));

mock.module("@typebot.io/emails/transactional/GuestInvitationEmail", () => ({
  sendGuestInvitationEmail,
}));

mock.module("@typebot.io/prisma", () => ({
  default: {
    collaboratorsOnTypebots: { create: collaboratorsOnTypebotsCreate },
    invitation: {
      create: invitationCreate,
      deleteMany: invitationDeleteMany,
    },
    memberInWorkspace: { upsert: memberInWorkspaceUpsert },
    typebot: { findFirst: typebotFindFirst },
    user: { findUnique: userFindUnique },
  },
}));

mock.module("@/helpers/databaseRules", () => ({
  canEditGuests: mock(() => ({ workspaceId: "workspace-id" })),
  canWriteTypebots: mock(() => ({ id: "typebot-id" })),
  isUniqueConstraintError: mock(() => false),
}));

const { handleCreateInvitation } = await import("./handleCreateInvitation");
const { handleDeleteInvitation } = await import("./handleDeleteInvitation");

const createInvitation = () =>
  handleCreateInvitation({
    input: {
      typebotId: "typebot-id",
      email: "guest@example.com",
      type: "READ",
    },
    context: {
      user: { id: "user-id", email: "host@example.com" },
    },
  });

describe("handleCreateInvitation", () => {
  beforeEach(() => {
    gentleRateLimit.mockReset();
    dailyGuestInvitationRateLimit.mockReset();
    typebotFindFirst.mockReset();
    userFindUnique.mockReset();
    invitationCreate.mockReset();
    invitationDeleteMany.mockReset();
    collaboratorsOnTypebotsCreate.mockReset();
    memberInWorkspaceUpsert.mockReset();
    sendGuestInvitationEmail.mockReset();

    gentleRateLimit.mockResolvedValue({ success: true });
    dailyGuestInvitationRateLimit.mockResolvedValue({ success: true });
    typebotFindFirst.mockResolvedValue({
      name: "Typebot",
      workspaceId: "workspace-id",
      workspace: { isSuspended: false, name: "Workspace" },
    });
    userFindUnique.mockResolvedValue(null);
    invitationCreate.mockResolvedValue({});
    invitationDeleteMany.mockResolvedValue({ count: 1 });
    sendGuestInvitationEmail.mockResolvedValue(undefined);
  });

  it("rejects suspended workspaces before consuming the daily allowance", async () => {
    typebotFindFirst.mockResolvedValue({
      name: "Typebot",
      workspaceId: "workspace-id",
      workspace: { isSuspended: true, name: "Workspace" },
    });

    await expect(createInvitation()).rejects.toBeDefined();

    expect(dailyGuestInvitationRateLimit).not.toHaveBeenCalled();
    expect(invitationCreate).not.toHaveBeenCalled();
    expect(sendGuestInvitationEmail).not.toHaveBeenCalled();
  });

  it("limits guest invitation attempts by workspace", async () => {
    dailyGuestInvitationRateLimit.mockResolvedValue({ success: false });

    await expect(createInvitation()).rejects.toBeDefined();

    expect(dailyGuestInvitationRateLimit).toHaveBeenCalledWith("workspace-id");
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(invitationCreate).not.toHaveBeenCalled();
    expect(sendGuestInvitationEmail).not.toHaveBeenCalled();
  });

  it("does not replenish the daily allowance when an invitation is deleted", async () => {
    dailyGuestInvitationRateLimit
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false });

    await expect(createInvitation()).resolves.toEqual({ message: "success" });

    await handleDeleteInvitation({
      input: { typebotId: "typebot-id", email: "guest@example.com" },
      context: { user: { id: "user-id" } },
    });

    await expect(createInvitation()).rejects.toBeDefined();

    expect(invitationDeleteMany).toHaveBeenCalledTimes(1);
    expect(dailyGuestInvitationRateLimit).toHaveBeenCalledTimes(2);
    expect(invitationCreate).toHaveBeenCalledTimes(1);
    expect(sendGuestInvitationEmail).toHaveBeenCalledTimes(1);
  });
});
