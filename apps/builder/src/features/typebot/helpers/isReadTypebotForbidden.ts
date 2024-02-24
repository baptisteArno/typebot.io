import { env } from '@typebot.io/env'
import {
  CollaboratorsOnTypebots,
  User,
  Workspace,
  MemberInWorkspace,
  Typebot,
} from '@typebot.io/prisma'
import { settingsSchema } from '@typebot.io/schemas'

export const isReadTypebotForbidden = async (
  typebot: {
    settings?: Typebot['settings']
    collaborators: Pick<CollaboratorsOnTypebots, 'userId'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId'>[]
    }
  },
  user?: Pick<User, 'email' | 'id'>
) => {
  const settings = typebot.settings
    ? settingsSchema.parse(typebot.settings)
    : undefined
  const isTypebotPublic = settings?.publicShare?.isEnabled === true
  if (isTypebotPublic) return false
  return (
    !user ||
    typebot.workspace.isSuspended ||
    typebot.workspace.isPastDue ||
    (env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
      !typebot.collaborators.some(
        (collaborator) => collaborator.userId === user.id
      ) &&
      !typebot.workspace.members.some((member) => member.userId === user.id))
  )
}
