import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  workspaceInvitationSchema,
  workspaceMemberSchema,
  workspaceSchema,
} from "@typebot.io/workspaces/schemas";
import { z } from "zod";
import {
  createWorkspaceInputSchema,
  handleCreateWorkspace,
} from "./handleCreateWorkspace";
import {
  createWorkspaceInvitationInputSchema,
  handleCreateWorkspaceInvitation,
} from "./handleCreateWorkspaceInvitation";
import {
  deleteWorkspaceInputSchema,
  handleDeleteWorkspace,
} from "./handleDeleteWorkspace";
import {
  deleteWorkspaceInvitationInputSchema,
  handleDeleteWorkspaceInvitation,
} from "./handleDeleteWorkspaceInvitation";
import {
  deleteWorkspaceMemberInputSchema,
  handleDeleteWorkspaceMember,
} from "./handleDeleteWorkspaceMember";
import {
  getWorkspaceInputSchema,
  handleGetWorkspace,
  inAppWorkspaceSchema,
} from "./handleGetWorkspace";
import {
  handleListInvitationsInWorkspace,
  listInvitationsInWorkspaceInputSchema,
} from "./handleListInvitationsInWorkspace";
import {
  handleListMembersInWorkspace,
  listMembersInWorkspaceInputSchema,
} from "./handleListMembersInWorkspace";
import { handleListWorkspaces } from "./handleListWorkspaces";
import {
  handleUpdateWorkspace,
  updateWorkspaceInputSchema,
} from "./handleUpdateWorkspace";
import {
  handleUpdateWorkspaceInvitation,
  updateWorkspaceInvitationInputSchema,
} from "./handleUpdateWorkspaceInvitation";
import {
  handleUpdateWorkspaceMember,
  updateWorkspaceMemberInputSchema,
} from "./handleUpdateWorkspaceMember";

export const workspaceRouter = {
  listWorkspaces: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces",
      summary: "List workspaces",
      tags: ["Workspace"],
    })
    .output(
      z.object({
        workspaces: z.array(
          workspaceSchema.pick({
            id: true,
            name: true,
            icon: true,
            plan: true,
          }),
        ),
      }),
    )
    .handler(handleListWorkspaces),

  getWorkspace: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces/{workspaceId}",
      summary: "Get workspace",
      tags: ["Workspace"],
    })
    .input(getWorkspaceInputSchema)
    .output(
      z.object({
        workspace: inAppWorkspaceSchema,
        currentUserMode: z.enum(["read", "write", "guest"]),
      }),
    )
    .handler(handleGetWorkspace),

  createWorkspace: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/workspaces",
      summary: "Create workspace",
      tags: ["Workspace"],
    })
    .input(createWorkspaceInputSchema)
    .output(
      z.object({
        workspace: workspaceSchema.omit({
          chatsLimitFirstEmailSentAt: true,
          chatsLimitSecondEmailSentAt: true,
          storageLimitFirstEmailSentAt: true,
          storageLimitSecondEmailSentAt: true,
          customChatsLimit: true,
          customSeatsLimit: true,
          customStorageLimit: true,
          additionalChatsIndex: true,
          additionalStorageIndex: true,
          isQuarantined: true,
        }),
      }),
    )
    .handler(handleCreateWorkspace),

  updateWorkspace: authenticatedProcedure
    .route({
      method: "PATCH",
      path: "/v1/workspaces/{workspaceId}",
      summary: "Update workspace",
      tags: ["Workspace"],
    })
    .input(updateWorkspaceInputSchema)
    .output(
      z.object({
        workspace: workspaceSchema.pick({ name: true, icon: true }),
      }),
    )
    .handler(handleUpdateWorkspace),

  deleteWorkspace: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/workspaces/{workspaceId}",
      summary: "Delete workspace",
      tags: ["Workspace"],
    })
    .input(deleteWorkspaceInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleDeleteWorkspace),

  listMembersInWorkspace: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces/{workspaceId}/members",
      summary: "List members in workspace",
      tags: ["Workspace"],
    })
    .input(listMembersInWorkspaceInputSchema)
    .output(z.object({ members: z.array(workspaceMemberSchema) }))
    .handler(handleListMembersInWorkspace),

  listInvitationsInWorkspace: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces/{workspaceId}/invitations",
      summary: "List invitations in workspace",
      tags: ["Workspace"],
    })
    .input(listInvitationsInWorkspaceInputSchema)
    .output(z.object({ invitations: z.array(workspaceInvitationSchema) }))
    .handler(handleListInvitationsInWorkspace),
  createWorkspaceInvitation: authenticatedProcedure
    .input(createWorkspaceInvitationInputSchema)
    .handler(handleCreateWorkspaceInvitation),

  updateWorkspaceInvitation: authenticatedProcedure
    .input(updateWorkspaceInvitationInputSchema)
    .handler(handleUpdateWorkspaceInvitation),

  deleteWorkspaceInvitation: authenticatedProcedure
    .input(deleteWorkspaceInvitationInputSchema)
    .handler(handleDeleteWorkspaceInvitation),

  updateWorkspaceMember: authenticatedProcedure
    .input(updateWorkspaceMemberInputSchema)
    .handler(handleUpdateWorkspaceMember),

  deleteWorkspaceMember: authenticatedProcedure
    .input(deleteWorkspaceMemberInputSchema)
    .handler(handleDeleteWorkspaceMember),
};
