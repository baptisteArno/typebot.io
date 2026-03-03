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
      name: true,
      workspaceId: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      isArchived: true,
      workspace: {
        select: {
          name: true,
        },
      },
    },
  })
