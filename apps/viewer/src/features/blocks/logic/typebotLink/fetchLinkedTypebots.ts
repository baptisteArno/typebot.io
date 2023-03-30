import { canReadTypebots } from '@/helpers/api/dbRules'
import prisma from '@/lib/prisma'
import { User } from '@typebot.io/prisma'
import { PublicTypebot, Typebot } from '@typebot.io/schemas'

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
  const linkedTypebots = (
    isPreview
      ? await prisma.typebot.findMany({
          where: user
            ? {
                AND: [
                  { id: { in: typebotIds } },
                  canReadTypebots(typebotIds, user as User),
                ],
              }
            : { id: { in: typebotIds } },
        })
      : await prisma.publicTypebot.findMany({
          where: { id: { in: typebotIds } },
        })
  ) as (Typebot | PublicTypebot)[]
  return linkedTypebots
}
