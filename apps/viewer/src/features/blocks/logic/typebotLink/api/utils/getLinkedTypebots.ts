import prisma from '@/lib/prisma'
import { PublicTypebot, Typebot } from 'models'

type Props = {
  isPreview: boolean
  typebotIds: string[]
}

export const getLinkedTypebots = async ({ isPreview, typebotIds }: Props) => {
  const linkedTypebots = (
    isPreview
      ? await prisma.typebot.findMany({
          where: { id: { in: typebotIds } },
        })
      : await prisma.publicTypebot.findMany({
          where: { id: { in: typebotIds } },
        })
  ) as (Typebot | PublicTypebot)[]
  return linkedTypebots
}
