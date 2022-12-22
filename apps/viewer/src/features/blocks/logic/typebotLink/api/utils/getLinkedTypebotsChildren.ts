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

type Props = {
  typebots: Pick<PublicTypebot, 'groups'>[]
  user?: User
  isPreview?: boolean
}

export const getLinkedTypebotsChildren =
  ({ typebots, user, isPreview }: Props) =>
  async (
    capturedLinkedBots: (Typebot | PublicTypebot)[]
  ): Promise<(Typebot | PublicTypebot)[]> => {
    const linkedTypebotIds = typebots
      .flatMap((typebot) =>
        (
          typebot.groups
            .flatMap((group) => group.blocks)
            .filter(
              (block) =>
                block.type === LogicBlockType.TYPEBOT_LINK &&
                isDefined(block.options.typebotId) &&
                !capturedLinkedBots.some(
                  (bot) =>
                    ('typebotId' in bot ? bot.typebotId : bot.id) ===
                    block.options.typebotId
                )
            ) as TypebotLinkBlock[]
        ).map((s) => s.options.typebotId)
      )
      .filter(isDefined)
    if (linkedTypebotIds.length === 0) return capturedLinkedBots
    const linkedTypebots = (
      isPreview
        ? await prisma.typebot.findMany({
            where: user
              ? {
                  AND: [
                    { id: { in: linkedTypebotIds } },
                    canReadTypebots(linkedTypebotIds, user as User),
                  ],
                }
              : { id: { in: linkedTypebotIds } },
          })
        : await prisma.publicTypebot.findMany({
            where: { id: { in: linkedTypebotIds } },
          })
    ) as (Typebot | PublicTypebot)[]
    return getLinkedTypebotsChildren({
      typebots: linkedTypebots,
      user,
      isPreview,
    })([...capturedLinkedBots, ...linkedTypebots])
  }
