import prisma from '@sniper.io/lib/prisma'

type Props = {
  isPreview?: boolean
  sniperIds: string[]
  userId: string | undefined
}

export const fetchLinkedSnipers = async ({
  userId,
  isPreview,
  sniperIds,
}: Props) => {
  if (!userId || !isPreview)
    return prisma.publicSniper.findMany({
      where: { sniperId: { in: sniperIds } },
    })
  const linkedSnipers = await prisma.sniper.findMany({
    where: { id: { in: sniperIds } },
    include: {
      collaborators: {
        select: {
          userId: true,
        },
      },
      workspace: {
        select: {
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  })

  return linkedSnipers.filter(
    (sniper) =>
      sniper.collaborators.some(
        (collaborator) => collaborator.userId === userId
      ) || sniper.workspace.members.some((member) => member.userId === userId)
  )
}
