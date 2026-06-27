import { beforeEach, describe, expect, it, mock } from "bun:test";

const workspaceFindFirst = mock();
const customDomainFindFirst = mock();
const customDomainDeleteMany = mock();
const kyDelete = mock();

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME = "viewer-project";
process.env.VERCEL_TEAM_ID = "team-id";
process.env.VERCEL_TOKEN = "vercel-token";

mock.module("@typebot.io/lib/ky", () => ({
  ky: {
    delete: kyDelete,
  },
}));

mock.module("@typebot.io/prisma", () => ({
  default: {
    workspace: {
      findFirst: workspaceFindFirst,
    },
    customDomain: {
      findFirst: customDomainFindFirst,
      deleteMany: customDomainDeleteMany,
    },
  },
}));

const { handleDeleteCustomDomain } = await import("./handleDeleteCustomDomain");

describe("handleDeleteCustomDomain", () => {
  beforeEach(() => {
    workspaceFindFirst.mockReset();
    customDomainFindFirst.mockReset();
    customDomainDeleteMany.mockReset();
    kyDelete.mockReset();

    workspaceFindFirst.mockResolvedValue({
      members: [{ userId: "user-id", role: "ADMIN" }],
    });
    kyDelete.mockResolvedValue({});
    customDomainDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("does not delete an external domain when it is not owned by the workspace", async () => {
    customDomainFindFirst.mockResolvedValue(null);

    await expect(
      handleDeleteCustomDomain({
        input: {
          workspaceId: "workspace-id",
          name: "other-workspace.example.com",
        },
        context: {
          user: { id: "user-id" },
        },
      }),
    ).rejects.toBeDefined();

    expect(customDomainFindFirst).toHaveBeenCalledWith({
      where: {
        name: "other-workspace.example.com",
        workspaceId: "workspace-id",
      },
      select: {
        name: true,
      },
    });
    expect(kyDelete).not.toHaveBeenCalled();
    expect(customDomainDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes an owned external domain and the matching database record", async () => {
    customDomainFindFirst.mockResolvedValue({
      name: "owned.example.com",
    });

    await expect(
      handleDeleteCustomDomain({
        input: {
          workspaceId: "workspace-id",
          name: "owned.example.com",
        },
        context: {
          user: { id: "user-id" },
        },
      }),
    ).resolves.toEqual({ message: "success" });

    expect(kyDelete).toHaveBeenCalledWith(
      "https://api.vercel.com/v9/projects/viewer-project/domains/owned.example.com?teamId=team-id",
      {
        headers: { Authorization: "Bearer vercel-token" },
      },
    );
    expect(customDomainDeleteMany).toHaveBeenCalledWith({
      where: {
        name: "owned.example.com",
        workspaceId: "workspace-id",
      },
    });
  });
});
