import prisma from '@typebot.io/lib/prisma'

type Props = {
  isPreview?: boolean
  typebotIds: string[]
  userId: string | undefined
}

export const fetchLinkedTypebots = async ({
  userId,
  isPreview,
  typebotIds,
}: Props) => {
  if (!userId || !isPreview)
    return prisma.publicTypebot.findMany({
      where: { typebotId: { in: typebotIds } },
    })
  const linkedTypebots = await prisma.typebot.findMany({
    where: { id: { in: typebotIds } },
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

  return linkedTypebots.filter(
    (typebot) =>
      typebot.collaborators.some(
        (collaborator) => collaborator.userId === userId
      ) || typebot.workspace.members.some((member) => member.userId === userId)
  )
}
