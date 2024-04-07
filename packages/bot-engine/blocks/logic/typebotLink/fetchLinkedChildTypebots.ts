import { User } from '@typebot.io/prisma'
import {
  Block,
  PublicTypebot,
  Typebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { fetchLinkedTypebots } from './fetchLinkedTypebots'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

type Props = {
  typebots: Pick<PublicTypebot, 'groups'>[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedChildTypebots =
  ({ typebots, userId, isPreview }: Props) =>
  async (
    capturedLinkedBots: (Typebot | PublicTypebot)[]
  ): Promise<(Typebot | PublicTypebot)[]> => {
    const linkedTypebotIds = typebots
      .flatMap((typebot) =>
        (
          typebot.groups
            .flatMap<Block>((group) => group.blocks)
            .filter(
              (block) =>
                block.type === LogicBlockType.TYPEBOT_LINK &&
                isDefined(block.options?.typebotId) &&
                !capturedLinkedBots.some(
                  (bot) =>
                    ('typebotId' in bot ? bot.typebotId : bot.id) ===
                    block.options?.typebotId
                )
            ) as TypebotLinkBlock[]
        ).map((b) => b.options?.typebotId)
      )
      .filter(isDefined)
    if (linkedTypebotIds.length === 0) return capturedLinkedBots
    const linkedTypebots = (await fetchLinkedTypebots({
      userId,
      typebotIds: linkedTypebotIds,
      isPreview,
    })) as (Typebot | PublicTypebot)[]
    return fetchLinkedChildTypebots({
      typebots: linkedTypebots,
      userId,
      isPreview,
    })([...capturedLinkedBots, ...linkedTypebots])
  }
