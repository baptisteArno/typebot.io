import { User } from '@sniper.io/prisma'
import {
  Block,
  PublicSniper,
  Sniper,
  SniperLinkBlock,
} from '@sniper.io/schemas'
import { isDefined } from '@sniper.io/lib'
import { fetchLinkedSnipers } from './fetchLinkedSnipers'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

type Props = {
  snipers: Pick<PublicSniper, 'groups'>[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedChildSnipers =
  ({ snipers, userId, isPreview }: Props) =>
  async (
    capturedLinkedBots: (Sniper | PublicSniper)[]
  ): Promise<(Sniper | PublicSniper)[]> => {
    const linkedSniperIds = snipers
      .flatMap((sniper) =>
        (
          sniper.groups
            .flatMap<Block>((group) => group.blocks)
            .filter(
              (block) =>
                block.type === LogicBlockType.SNIPER_LINK &&
                isDefined(block.options?.sniperId) &&
                !capturedLinkedBots.some(
                  (bot) =>
                    ('sniperId' in bot ? bot.sniperId : bot.id) ===
                    block.options?.sniperId
                )
            ) as SniperLinkBlock[]
        ).map((b) => b.options?.sniperId)
      )
      .filter(isDefined)
    if (linkedSniperIds.length === 0) return capturedLinkedBots
    const linkedSnipers = (await fetchLinkedSnipers({
      userId,
      sniperIds: linkedSniperIds,
      isPreview,
    })) as (Sniper | PublicSniper)[]
    return fetchLinkedChildSnipers({
      snipers: linkedSnipers,
      userId,
      isPreview,
    })([...capturedLinkedBots, ...linkedSnipers])
  }
