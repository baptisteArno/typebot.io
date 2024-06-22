import { isNotDefined } from '@sniper.io/lib'
import { PublicSniperV6 } from '@sniper.io/schemas'
import { isInputBlock } from '@sniper.io/schemas/helpers'
import {
  TotalAnswers,
  TotalVisitedEdges,
} from '@sniper.io/schemas/features/analytics'

export const computeTotalUsersAtBlock = (
  currentBlockId: string,
  {
    publishedSniper,
    totalVisitedEdges,
    totalAnswers,
  }: {
    publishedSniper: PublicSniperV6
    totalVisitedEdges: TotalVisitedEdges[]
    totalAnswers: TotalAnswers[]
  }
): number => {
  let totalUsers = 0
  const currentGroup = publishedSniper.groups.find((group) =>
    group.blocks.find((block) => block.id === currentBlockId)
  )
  if (!currentGroup) return 0
  const currentBlockIndex = currentGroup.blocks.findIndex(
    (block) => block.id === currentBlockId
  )
  const previousBlocks = currentGroup.blocks.slice(0, currentBlockIndex + 1)
  for (const block of previousBlocks.reverse()) {
    if (currentBlockId !== block.id && isInputBlock(block))
      return totalAnswers.find((t) => t.blockId === block.id)?.total ?? 0
    const incomingEdges = publishedSniper.edges.filter(
      (edge) => edge.to.blockId === block.id
    )
    if (!incomingEdges.length) continue
    totalUsers += incomingEdges.reduce(
      (acc, incomingEdge) =>
        acc +
        (totalVisitedEdges.find(
          (totalEdge) => totalEdge.edgeId === incomingEdge.id
        )?.total ?? 0),
      0
    )
  }
  const edgesConnectedToGroup = publishedSniper.edges.filter(
    (edge) =>
      edge.to.groupId === currentGroup.id && isNotDefined(edge.to.blockId)
  )

  totalUsers += edgesConnectedToGroup.reduce(
    (acc, connectedEdge) =>
      acc +
      (totalVisitedEdges.find(
        (totalEdge) => totalEdge.edgeId === connectedEdge.id
      )?.total ?? 0),
    0
  )

  return totalUsers
}
