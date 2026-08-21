import { beforeEach, describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();
const resultCount = mock();
const transaction = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findFirst: typebotFindFirst },
    result: { count: resultCount },
    $transaction: transaction,
  },
}));

const { handleGetStats } = await import("./handleGetStats");

const guest = { id: "guest-id", email: "guest@example.com" };

describe("handleGetStats", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
    resultCount.mockReset();
    transaction.mockReset();
  });

  it("does not expose analytics to a non-collaborating guest", async () => {
    typebotFindFirst.mockResolvedValue(null);

    await expect(
      handleGetStats({
        input: { typebotId: "typebot-id", timeFilter: "allTime" },
        context: { user: guest },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: {
        id: "typebot-id",
        OR: [
          {
            workspace: {
              members: {
                some: { userId: guest.id, role: { not: "GUEST" } },
              },
            },
          },
          { collaborators: { some: { userId: guest.id } } },
        ],
      },
      select: { publishedTypebot: true, id: true },
    });
    expect(transaction).not.toHaveBeenCalled();
  });
});
