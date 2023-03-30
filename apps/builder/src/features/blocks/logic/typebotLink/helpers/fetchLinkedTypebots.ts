import prisma from '@/lib/prisma'
import { canReadTypebots } from '@/helpers/databaseRules'
import { User } from '@typebot.io/prisma'
import { LogicBlockType, PublicTypebot, Typebot } from '@typebot.io/schemas'

export const fetchLinkedTypebots = async (
  typebot: Pick<PublicTypebot, 'groups'>,
  user?: User
): Promise<(Typebot | PublicTypebot)[]> => {
  const linkedTypebotIds = typebot.groups
    .flatMap((group) => group.blocks)
    .reduce<string[]>((typebotIds, block) => {
      if (block.type !== LogicBlockType.TYPEBOT_LINK) return typebotIds
      const typebotId = block.options.typebotId
      if (!typebotId) return typebotIds
      return typebotIds.includes(typebotId)
        ? typebotIds
        : [...typebotIds, typebotId]
    }, [])
  if (linkedTypebotIds.length === 0) return []
  const typebots = (await ('typebotId' in typebot
    ? prisma.publicTypebot.findMany({
        where: { id: { in: linkedTypebotIds } },
      })
    : prisma.typebot.findMany({
        where: user
          ? {
              AND: [
                { id: { in: linkedTypebotIds } },
                canReadTypebots(linkedTypebotIds, user as User),
              ],
            }
          : { id: { in: linkedTypebotIds } },
      }))) as (Typebot | PublicTypebot)[]
  return typebots
}
