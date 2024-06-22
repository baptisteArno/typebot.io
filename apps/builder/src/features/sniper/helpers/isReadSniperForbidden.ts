import { env } from '@sniper.io/env'
import {
  CollaboratorsOnSnipers,
  User,
  Workspace,
  MemberInWorkspace,
  Sniper,
} from '@sniper.io/prisma'
import { settingsSchema } from '@sniper.io/schemas'

export const isReadSniperForbidden = async (
  sniper: {
    settings?: Sniper['settings']
    collaborators: Pick<CollaboratorsOnSnipers, 'userId'>[]
  } & {
    workspace: Pick<Workspace, 'isSuspended' | 'isPastDue'> & {
      members: Pick<MemberInWorkspace, 'userId'>[]
    }
  },
  user?: Pick<User, 'email' | 'id'>
) => {
  const settings = sniper.settings
    ? settingsSchema.parse(sniper.settings)
    : undefined
  const isSniperPublic = settings?.publicShare?.isEnabled === true
  if (isSniperPublic) return false
  return (
    !user ||
    sniper.workspace.isSuspended ||
    sniper.workspace.isPastDue ||
    (env.ADMIN_EMAIL?.every((email) => email !== user.email) &&
      !sniper.collaborators.some(
        (collaborator) => collaborator.userId === user.id
      ) &&
      !sniper.workspace.members.some((member) => member.userId === user.id))
  )
}
