import prisma from '@/lib/prisma'
import { CollaborationType, CollaboratorsOnTypebots, User } from 'db'
import { Typebot } from 'models'
import { isNotDefined } from 'utils'

export const isWriteTypebotForbidden = async (
  typebot: Pick<Typebot, 'workspaceId'> & {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
    process.env.ADMIN_EMAIL === user.email ||
    typebot.collaborators.find(
      (collaborator) => collaborator.userId === user.id
    )?.type === CollaborationType.WRITE
  )
    return false
  const memberInWorkspace = await prisma.memberInWorkspace.findFirst({
    where: {
      workspaceId: typebot.workspaceId,
      userId: user.id,
    },
  })
  return isNotDefined(memberInWorkspace) || memberInWorkspace.role === 'GUEST'
}
