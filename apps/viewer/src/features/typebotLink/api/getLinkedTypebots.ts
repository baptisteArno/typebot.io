import prisma from '@/lib/prisma'
import { canReadTypebots } from '@/utils/api/dbRules'
import { User } from 'db'
import {
  LogicBlockType,
  PublicTypebot,
  Typebot,
  TypebotLinkBlock,
} from 'models'
import { isDefined } from 'utils'

export const getLinkedTypebots = async (
  typebot: Typebot | PublicTypebot,
  user?: User
): Promise<(Typebot | PublicTypebot)[]> => {
  const linkedTypebotIds = (
    typebot.groups
      .flatMap((g) => g.blocks)
      .filter(
        (s) =>
          s.type === LogicBlockType.TYPEBOT_LINK &&
          isDefined(s.options.typebotId)
      ) as TypebotLinkBlock[]
  ).map((s) => s.options.typebotId as string)
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
      }))) as unknown as (Typebot | PublicTypebot)[]
  return typebots
}
