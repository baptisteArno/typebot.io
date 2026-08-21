import { beforeEach, describe, expect, it, mock } from "bun:test";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

const typebotFindUnique = mock();
const logFindMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findUnique: typebotFindUnique },
    log: { findMany: logFindMany },
  },
}));

const { handleGetResultLogs } = await import("./handleGetResultLogs");

const guest = { id: "guest-id", email: "guest@example.com" };

describe("handleGetResultLogs", () => {
  beforeEach(() => {
    typebotFindUnique.mockReset();
    logFindMany.mockReset();
  });

  it("does not expose logs to a non-collaborating guest", async () => {
    typebotFindUnique.mockResolvedValue({
      id: "typebot-id",
      groups: [],
      collaborators: [],
      workspace: {
        isSuspended: false,
        isPastDue: false,
        members: [{ userId: guest.id, role: WorkspaceRole.GUEST }],
      },
    });

    await expect(
      handleGetResultLogs({
        input: { typebotId: "typebot-id", resultId: "result-id" },
        context: { user: guest },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(logFindMany).not.toHaveBeenCalled();
  });

  it("preserves log access for an explicitly collaborating guest", async () => {
    const logs = [{ id: "log-id" }];
    typebotFindUnique.mockResolvedValue({
      id: "typebot-id",
      groups: [],
      collaborators: [{ userId: guest.id, type: "READ" }],
      workspace: {
        isSuspended: false,
        isPastDue: false,
        members: [{ userId: guest.id, role: WorkspaceRole.GUEST }],
      },
    });
    logFindMany.mockResolvedValue(logs);

    await expect(
      handleGetResultLogs({
        input: { typebotId: "typebot-id", resultId: "result-id" },
        context: { user: guest },
      }),
    ).resolves.toEqual({ logs });
  });
});
