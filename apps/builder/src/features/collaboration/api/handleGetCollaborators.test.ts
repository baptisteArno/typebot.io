import { beforeEach, describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME = "viewer-project";
process.env.VERCEL_TEAM_ID = "team-id";
process.env.VERCEL_TOKEN = "vercel-token";

mock.module("@typebot.io/prisma", () => ({
  default: {
    typebot: { findFirst: typebotFindFirst },
  },
}));

const { handleGetCollaborators } = await import("./handleGetCollaborators");

const user = { id: "user-id", email: "user@example.com" };

describe("handleGetCollaborators", () => {
  beforeEach(() => {
    typebotFindFirst.mockReset();
  });

  it("does not expose collaborators to a non-collaborating guest", async () => {
    typebotFindFirst.mockResolvedValue(null);

    await expect(
      handleGetCollaborators({
        input: { typebotId: "public-typebot-id" },
        context: { user },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: {
        id: "public-typebot-id",
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { not: "GUEST" } },
              },
            },
          },
          { collaborators: { some: { userId: user.id } } },
        ],
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });
  });

  it("returns collaborator identity data to an authorized workspace member", async () => {
    const collaborators = [
      {
        userId: "collaborator-id",
        typebotId: "typebot-id",
        type: "READ",
        user: {
          name: "Collaborator",
          image: "https://example.com/avatar.png",
          email: "collaborator@example.com",
        },
      },
    ];
    typebotFindFirst.mockResolvedValue({
      id: "typebot-id",
      collaborators,
    });

    await expect(
      handleGetCollaborators({
        input: { typebotId: "typebot-id" },
        context: { user },
      }),
    ).resolves.toEqual({ collaborators });
  });
});
