import { byId } from '@typebot.io/lib'
import { PublicTypebotV6 } from '@typebot.io/schemas'
import { TotalAnswers } from '@typebot.io/schemas/features/analytics'

export const getTotalAnswersAtBlock = (
  currentBlockId: string,
  {
    publishedTypebot,
    totalAnswers,
  }: {
    publishedTypebot: PublicTypebotV6
    totalAnswers: TotalAnswers[]
  }
): number => {
  const block = publishedTypebot.groups
    .flatMap((g) => g.blocks)
    .find(byId(currentBlockId))
  if (!block) throw new Error(`Block ${currentBlockId} not found`)
  return totalAnswers.find((t) => t.blockId === block.id)?.total ?? 0
}
