import prisma from '@sniper.io/lib/prisma'

type Props = {
  id: string
  userId?: string
}

export const findSniper = ({ id, userId }: Props) =>
  prisma.sniper.findFirst({
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
    },
  })
