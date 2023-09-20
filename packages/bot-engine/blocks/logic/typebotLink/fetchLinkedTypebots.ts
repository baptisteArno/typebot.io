import prisma from '@typebot.io/lib/prisma'
import { User } from '@typebot.io/prisma'

type Props = {
  isPreview?: boolean
  typebotIds: string[]
  user?: User
}

export const fetchLinkedTypebots = async ({
  user,
  isPreview,
  typebotIds,
}: Props) => {
  if (!user || !isPreview)
    return prisma.publicTypebot.findMany({
      where: { id: { in: typebotIds } },
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
        (collaborator) => collaborator.userId === user.id
      ) || typebot.workspace.members.some((member) => member.userId === user.id)
  )
}
