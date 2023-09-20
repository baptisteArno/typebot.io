import { User } from '@typebot.io/prisma'
import {
  LogicBlockType,
  PublicTypebot,
  Typebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { fetchLinkedTypebots } from './fetchLinkedTypebots'

type Props = {
  typebots: Pick<PublicTypebot, 'groups'>[]
  user?: User
  isPreview?: boolean
}

export const getPreviouslyLinkedTypebots =
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
    const linkedTypebots = (await fetchLinkedTypebots({
      user,
      typebotIds: linkedTypebotIds,
      isPreview,
    })) as (Typebot | PublicTypebot)[]
    return getPreviouslyLinkedTypebots({
      typebots: linkedTypebots,
      user,
      isPreview,
    })([...capturedLinkedBots, ...linkedTypebots])
  }
