import prisma from '@typebot.io/lib/prisma'

type Props = {
  id: string
  userId?: string
}

export const findTypebot = ({ id, userId }: Props) =>
  prisma.typebot.findFirst({
    where: { id, workspace: { members: { some: { userId } } } },
    select: {
      version: true,
      id: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      isArchived: true,
      updatedAt: true,
    },
  })
