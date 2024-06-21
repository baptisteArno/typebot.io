import prisma from '@sniper.io/lib/prisma'

type Props = {
  publicId: string
}

export const findPublicSniper = ({ publicId }: Props) =>
  prisma.publicSniper.findFirst({
    where: { sniper: { publicId } },
    select: {
      version: true,
      groups: true,
      events: true,
      edges: true,
      settings: true,
      theme: true,
      variables: true,
      sniperId: true,
      sniper: {
        select: {
          isArchived: true,
          isClosed: true,
          workspace: {
            select: {
              id: true,
              plan: true,
              customChatsLimit: true,
              isQuarantined: true,
              isSuspended: true,
            },
          },
        },
      },
    },
  })
