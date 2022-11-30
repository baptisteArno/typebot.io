import { router } from '@/utils/server/trpc'
import {
  createWorkspaceProcedure,
  deleteWorkspaceProcedure,
  getWorkspaceProcedure,
  listMembersInWorkspaceProcedure,
  listWorkspacesProcedure,
  updateWorkspaceProcedure,
} from './procedures'

export const workspaceRouter = router({
  listWorkspaces: listWorkspacesProcedure,
  getWorkspace: getWorkspaceProcedure,
  listMembersInWorkspace: listMembersInWorkspaceProcedure,
  createWorkspace: createWorkspaceProcedure,
  updateWorkspace: updateWorkspaceProcedure,
  deleteWorkspace: deleteWorkspaceProcedure,
})
