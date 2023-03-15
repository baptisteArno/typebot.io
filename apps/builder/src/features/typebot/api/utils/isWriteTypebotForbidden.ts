import prisma from '@/lib/prisma'
import {
  CollaborationType,
  CollaboratorsOnTypebots,
  User,
} from '@typebot.io/prisma'
import { Typebot } from '@typebot.io/schemas'
import { isNotDefined } from '@typebot.io/lib'

export const isWriteTypebotForbidden = async (
  typebot: Pick<Typebot, 'workspaceId'> & {
    collaborators: Pick<CollaboratorsOnTypebots, 'userId' | 'type'>[]
  },
  user: Pick<User, 'email' | 'id'>
) => {
  if (
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
