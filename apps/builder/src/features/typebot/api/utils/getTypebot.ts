import prisma from '@/lib/prisma'
import { Prisma, User } from '@typebot.io/prisma'
import { isReadTypebotForbidden } from './isReadTypebotForbidden'
import { isWriteTypebotForbidden } from './isWriteTypebotForbidden'

type Props<T extends Prisma.TypebotSelect> = {
  typebotId: string
  user: Pick<User, 'id' | 'email'>
  accessLevel: 'read' | 'write'
  select?: T
}

export const getTypebot = async <T extends Prisma.TypebotSelect>({
  typebotId,
  user,
  accessLevel,
  select,
}: Props<T>) => {
  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      ...select,
      id: true,
      workspaceId: true,
      collaborators: { select: { userId: true, type: true } },
    },
  })
  if (!typebot) return null
  if (accessLevel === 'read' && (await isReadTypebotForbidden(typebot, user)))
    return null
  if (accessLevel === 'write' && (await isWriteTypebotForbidden(typebot, user)))
    return null
  return typebot
}
