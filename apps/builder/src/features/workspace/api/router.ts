import { createWorkspace } from "./createWorkspace";
import { createWorkspaceInvitation } from "./createWorkspaceInvitation";
import { deleteWorkspace } from "./deleteWorkspace";
import { deleteWorkspaceInvitation } from "./deleteWorkspaceInvitation";
import { deleteWorkspaceMember } from "./deleteWorkspaceMember";
import { getWorkspace } from "./getWorkspace";
import { listInvitationsInWorkspace } from "./listInvitationsInWorkspace";
import { listMembersInWorkspace } from "./listMembersInWorkspace";
import { listWorkspaces } from "./listWorkspaces";
import { updateWorkspace } from "./updateWorkspace";
import { updateWorkspaceInvitation } from "./updateWorkspaceInvitation";
import { updateWorkspaceMember } from "./updateWorkspaceMember";

export const workspaceRouter = {
  listWorkspaces,
  getWorkspace,
  listMembersInWorkspace,
  listInvitationsInWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createWorkspaceInvitation,
  updateWorkspaceInvitation,
  deleteWorkspaceInvitation,
  updateWorkspaceMember,
  deleteWorkspaceMember,
};
