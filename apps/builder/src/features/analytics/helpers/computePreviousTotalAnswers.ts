import { isInputBlock } from '@typebot.io/lib'
import { PublicTypebot } from '@typebot.io/schemas'
import { TotalAnswersInBlock } from '@typebot.io/schemas/features/analytics'

export const computePreviousTotalAnswers = (
  publishedTypebot: PublicTypebot,
  currentBlockId: string,
  totalAnswersInBlocks: TotalAnswersInBlock[],
  visitedBlocks: string[] = []
): number => {
  let totalAnswers = 0
  const allBlocks = publishedTypebot.groups.flatMap((group) => group.blocks)
  const currentGroup = publishedTypebot.groups.find((group) =>
    group.blocks.find((block) => block.id === currentBlockId)
  )
  if (!currentGroup) return 0
  const currentBlockIndex = currentGroup.blocks.findIndex(
    (block) => block.id === currentBlockId
  )
  const previousBlocks = currentGroup.blocks.slice(0, currentBlockIndex + 1)
  for (const block of previousBlocks.reverse()) {
    if (visitedBlocks.includes(block.id)) continue
    if (
      currentBlockId !== block.id &&
      (isInputBlock(block) || block.type === 'start')
    ) {
      visitedBlocks.push(block.id)
      return (
        totalAnswersInBlocks.find(
          (totalAnswersInBlock) =>
            totalAnswersInBlock.blockId === block.id &&
            totalAnswersInBlock.itemId === undefined
        )?.total ?? 0
      )
    }
    const connectedEdges = publishedTypebot.edges.filter(
      (edge) => edge.to.blockId === block.id
    )
    if (connectedEdges.length) {
      for (const connectedEdge of connectedEdges) {
        const connectedBlock = allBlocks.find(
          (block) => block.id === connectedEdge.from.blockId
        )
        if (connectedBlock && !visitedBlocks.includes(connectedBlock.id)) {
          if (isInputBlock(connectedBlock) || connectedBlock.type === 'start') {
            visitedBlocks.push(connectedBlock.id)
            totalAnswers +=
              totalAnswersInBlocks.find(
                (totalAnswersInBlock) =>
                  totalAnswersInBlock.blockId === connectedEdge.from.blockId &&
                  totalAnswersInBlock.itemId === connectedEdge.from.itemId
              )?.total ?? 0
          } else {
            totalAnswers += computePreviousTotalAnswers(
              publishedTypebot,
              connectedBlock.id,
              totalAnswersInBlocks,
              visitedBlocks
            )
          }
        }
      }
    }
  }
  const edgesConnectedToGroup = publishedTypebot.edges.filter(
    (edge) => edge.to.groupId === currentGroup.id
  )

  if (edgesConnectedToGroup.length) {
    for (const connectedEdge of edgesConnectedToGroup) {
      const connectedBlock = allBlocks.find(
        (block) => block.id === connectedEdge.from.blockId
      )
      if (connectedBlock && !visitedBlocks.includes(connectedBlock.id)) {
        if (isInputBlock(connectedBlock) || connectedBlock.type === 'start') {
          visitedBlocks.push(connectedBlock.id)
          totalAnswers +=
            totalAnswersInBlocks.find(
              (totalAnswersInBlock) =>
                totalAnswersInBlock.blockId === connectedEdge.from.blockId &&
                totalAnswersInBlock.itemId === connectedEdge.from.itemId
            )?.total ?? 0
        } else {
          totalAnswers += computePreviousTotalAnswers(
            publishedTypebot,
            connectedBlock.id,
            totalAnswersInBlocks,
            visitedBlocks
          )
        }
      }
    }
  }

  return totalAnswers
}
