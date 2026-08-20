import { beforeEach, describe, expect, it, mock } from "bun:test";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

const workspaceInvitationUpdateMany = mock();

mock.module("@typebot.io/prisma", () => ({
  default: {
    workspaceInvitation: { updateMany: workspaceInvitationUpdateMany },
  },
}));

const {
  handleUpdateWorkspaceInvitation,
  updateWorkspaceInvitationInputSchema,
} = await import("./handleUpdateWorkspaceInvitation");

const crossWorkspaceTakeoverInput = {
  id: "attacker-workspace-invitation-id",
  email: "attacker@example.com",
  type: WorkspaceRole.ADMIN,
  workspaceId: "victim-workspace-id",
};

describe("handleUpdateWorkspaceInvitation", () => {
  beforeEach(() => {
    workspaceInvitationUpdateMany.mockReset();
    workspaceInvitationUpdateMany.mockResolvedValue({ count: 1 });
  });

  it("strips workspace reassignment from the input", () => {
    expect(
      updateWorkspaceInvitationInputSchema.parse(crossWorkspaceTakeoverInput),
    ).toEqual({
      id: "attacker-workspace-invitation-id",
      email: "attacker@example.com",
      type: WorkspaceRole.ADMIN,
    });
  });

  it("does not persist a cross-workspace admin takeover payload", async () => {
    await handleUpdateWorkspaceInvitation({
      input: crossWorkspaceTakeoverInput,
      context: { user: { id: "attacker-user-id" } },
    });

    expect(workspaceInvitationUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "attacker-workspace-invitation-id",
        workspace: {
          members: {
            some: {
              userId: "attacker-user-id",
              role: WorkspaceRole.ADMIN,
            },
          },
        },
      },
      data: {
        email: "attacker@example.com",
        type: WorkspaceRole.ADMIN,
      },
    });
  });
});
