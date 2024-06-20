import prisma from '@sniper.io/lib/prisma'
import { canReadSnipers } from '@/helpers/databaseRules'
import { User } from '@sniper.io/prisma'
import { Block, PublicSniper, Sniper } from '@sniper.io/schemas'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

export const fetchLinkedSnipers = async (
  sniper: Pick<PublicSniper, 'groups'>,
  user?: User
): Promise<(Sniper | PublicSniper)[]> => {
  const linkedSniperIds = sniper.groups
    .flatMap<Block>((group) => group.blocks)
    .reduce<string[]>((sniperIds, block) => {
      if (block.type !== LogicBlockType.SNIPER_LINK) return sniperIds
      const sniperId = block.options?.sniperId
      if (!sniperId) return sniperIds
      return sniperIds.includes(sniperId) ? sniperIds : [...sniperIds, sniperId]
    }, [])
  if (linkedSniperIds.length === 0) return []
  const snipers = (await ('sniperId' in sniper
    ? prisma.publicSniper.findMany({
        where: { id: { in: linkedSniperIds } },
      })
    : prisma.sniper.findMany({
        where: user
          ? {
              AND: [
                { id: { in: linkedSniperIds } },
                canReadSnipers(linkedSniperIds, user as User),
              ],
            }
          : { id: { in: linkedSniperIds } },
      }))) as (Sniper | PublicSniper)[]
  return snipers
}
