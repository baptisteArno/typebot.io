import { describe, expect, it, mock } from "bun:test";

const typebotFindFirst = mock();

mock.module("@typebot.io/prisma", () => ({
  default: { typebot: { findFirst: typebotFindFirst } },
}));

const { findTypebot } = await import("./findTypebot");

describe("findTypebot", () => {
  it("requires guests starting a preview to be explicit collaborators", async () => {
    typebotFindFirst.mockResolvedValue(null);

    await expect(
      findTypebot({ id: "typebot-id", userId: "guest-id" }),
    ).resolves.toBeNull();

    expect(typebotFindFirst).toHaveBeenCalledWith({
      where: {
        id: "typebot-id",
        OR: [
          {
            workspace: {
              members: {
                some: { userId: "guest-id", role: { not: "GUEST" } },
              },
            },
          },
          { collaborators: { some: { userId: "guest-id" } } },
        ],
      },
      select: {
        version: true,
        id: true,
        groups: true,
        events: true,
        edges: true,
        settings: true,
        theme: true,
        variables: true,
        isArchived: true,
        updatedAt: true,
        workspaceId: true,
      },
    });
  });
});
