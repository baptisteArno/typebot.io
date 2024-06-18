import { byId } from '@sniper.io/lib'
import { PublicSniperV6 } from '@sniper.io/schemas'
import { TotalAnswers } from '@sniper.io/schemas/features/analytics'

export const getTotalAnswersAtBlock = (
  currentBlockId: string,
  {
    publishedSniper,
    totalAnswers,
  }: {
    publishedSniper: PublicSniperV6
    totalAnswers: TotalAnswers[]
  }
): number => {
  const block = publishedSniper.groups
    .flatMap((g) => g.blocks)
    .find(byId(currentBlockId))
  if (!block) throw new Error(`Block ${currentBlockId} not found`)
  return totalAnswers.find((t) => t.blockId === block.id)?.total ?? 0
}
