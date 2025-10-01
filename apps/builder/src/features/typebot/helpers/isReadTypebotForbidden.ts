import { env } from '@typebot.io/env'
import {
  CollaboratorsOnTypebots,
  User,
  Workspace,
  MemberInWorkspace,
  Typebot,
} from '@typebot.io/prisma'
import { settingsSchema } from '@typebot.io/schemas'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'

export const isReadTypebotForbidden = async (
  typebot: {
    settings?: Typebot['settings']
    collaborators: Pick<CollaboratorsOnTypebots, 'userId'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId'>[]
    } & {
      name?: string
    }
  },
  user?: Pick<User, 'email' | 'id'> & { cognitoClaims?: unknown }
) => {
  const settings = typebot.settings
    ? settingsSchema.parse(typebot.settings)
    : undefined
  const isTypebotPublic = settings?.publicShare?.isEnabled === true

  if (isTypebotPublic) {
    return false
  }

  if (!user) {
    return true
  }

  if (typebot.workspace.isSuspended || typebot.workspace.isPastDue) {
    return true
  }

  // Check if user is admin
  if (env.ADMIN_EMAIL?.some((email) => email === user.email)) {
    return false
  }

  // Check if user is a collaborator on this specific typebot
  const isCollaborator = typebot.collaborators.some(
    (collaborator) => collaborator.userId === user.id
  )
  if (isCollaborator) {
    return false
  }

  // Use hybrid workspace access control (Cognito + database)
  return isReadWorkspaceFobidden(typebot.workspace, user)
}
