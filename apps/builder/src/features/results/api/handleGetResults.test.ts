import { beforeEach, describe, expect, it, mock } from "bun:test";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

const typebotFindUnique = mock();
const resultFindMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findUnique: typebotFindUnique },
    result: { findMany: resultFindMany },
  },
}));

const { handleGetResults } = await import("./handleGetResults");

const guest = { id: "guest-id", email: "guest@example.com" };

describe("handleGetResults", () => {
  beforeEach(() => {
    typebotFindUnique.mockReset();
    resultFindMany.mockReset();
  });

  it("does not expose results to a non-collaborating guest", async () => {
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
      handleGetResults({
        input: { typebotId: "typebot-id", limit: 50, timeFilter: "allTime" },
        context: { user: guest },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(resultFindMany).not.toHaveBeenCalled();
  });

  it("preserves result access for an explicitly collaborating guest", async () => {
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
    resultFindMany.mockResolvedValue([]);

    await expect(
      handleGetResults({
        input: { typebotId: "typebot-id", limit: 50, timeFilter: "allTime" },
        context: { user: guest },
      }),
    ).resolves.toEqual({ results: [], nextCursor: undefined });
  });
});
