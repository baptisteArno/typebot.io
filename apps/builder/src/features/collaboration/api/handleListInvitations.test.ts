import { beforeEach, describe, expect, it, mock } from "bun:test";

const invitationFindMany = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

mock.module("@typebot.io/prisma", () => ({
  default: { invitation: { findMany: invitationFindMany } },
}));

const { handleListInvitations } = await import("./handleListInvitations");

const guest = { id: "guest-id", email: "guest@example.com" };

describe("handleListInvitations", () => {
  beforeEach(() => {
    invitationFindMany.mockReset();
  });

  it("does not expose invitations to a non-collaborating guest", async () => {
    invitationFindMany.mockResolvedValue([]);

    await expect(
      handleListInvitations({
        input: { typebotId: "typebot-id" },
        context: { user: guest },
      }),
    ).resolves.toEqual({ invitations: [] });

    expect(invitationFindMany).toHaveBeenCalledWith({
      where: {
        typebotId: "typebot-id",
        typebot: {
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
      },
    });
  });
});
