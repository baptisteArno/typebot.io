import { beforeEach, describe, expect, it, mock } from "bun:test";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

const typebotFindFirst = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: { typebot: { findFirst: typebotFindFirst } },
}));

const { handleGetTypebot } = await import("./handleGetTypebot");

describe("handleGetTypebot", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
  });

  it("does not expose typebot content to a non-collaborating guest", async () => {
    typebotFindFirst.mockResolvedValue({
      id: "typebot-id",
      collaborators: [],
      workspace: {
        isSuspended: false,
        isPastDue: false,
        members: [{ userId: "guest-id", role: WorkspaceRole.GUEST }],
      },
    });

    await expect(
      handleGetTypebot({
        input: { typebotId: "typebot-id", migrateToLatestVersion: false },
        context: { user: { id: "guest-id", email: "guest@example.com" } },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: { id: "typebot-id" },
      include: {
        collaborators: {
          where: { userId: "guest-id" },
          select: { userId: true, type: true },
        },
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              where: { userId: "guest-id" },
              select: { userId: true, role: true },
            },
          },
        },
      },
    });
  });
});
