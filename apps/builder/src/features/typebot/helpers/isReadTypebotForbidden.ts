import { env } from '@typebot.io/env'
import {
  CollaboratorsOnTypebots,
  User,
  Workspace,
  MemberInWorkspace,
} from '@typebot.io/prisma'

export const isReadTypebotForbidden = async (
  typebot: {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId'>[]
  } & {
    workspace: Pick<Workspace, 'isQuarantined' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId'>[]
    }
  },
  user: Pick<User, 'email' | 'id'>
) =>
  typebot.workspace.isQuarantined ||
  typebot.workspace.isPastDue ||
  (env.ADMIN_EMAIL !== user.email &&
    !typebot.collaborators.some(
      (collaborator) => collaborator.userId === user.id
    ) &&
    !typebot.workspace.members.some((member) => member.userId === user.id))
