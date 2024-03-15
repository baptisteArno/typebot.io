import { isDefined, byId } from '@typebot.io/lib'
import {
  getBlockById,
  blockHasItems,
  isInputBlock,
} from '@typebot.io/schemas/helpers'
import { Block, SessionState } from '@typebot.io/schemas'

type Props = {
  typebotsQueue: SessionState['typebotsQueue']
  progressMetadata: NonNullable<SessionState['progressMetadata']>
  currentInputBlockId: string | undefined
}

export const computeCurrentProgress = ({
  typebotsQueue,
  progressMetadata,
  currentInputBlockId,
}: Props) => {
  if (!currentInputBlockId) return
  const paths = computePossibleNextInputBlocks({
    typebotsQueue: typebotsQueue,
    blockId: currentInputBlockId,
    visitedBlocks: {
      [typebotsQueue[0].typebot.id]: [],
    },
    currentPath: [],
  })
  return (
    ((progressMetadata.totalAnswers + 1) /
      (Math.max(...paths.map((b) => b.length)) +
        (progressMetadata.totalAnswers + 1))) *
    100
  )
}

const computePossibleNextInputBlocks = ({
  currentPath,
  typebotsQueue,
  blockId,
  visitedBlocks,
}: {
  currentPath: string[]
  typebotsQueue: SessionState['typebotsQueue']
  blockId: string
  visitedBlocks: {
    [key: string]: string[]
  }
}): string[][] => {
  if (visitedBlocks[typebotsQueue[0].typebot.id].includes(blockId)) return []
  visitedBlocks[typebotsQueue[0].typebot.id].push(blockId)

  const possibleNextInputBlocks: string[][] = []

  const { block, group, blockIndex } = getBlockById(
    blockId,
    typebotsQueue[0].typebot.groups
  )

  if (isInputBlock(block)) currentPath.push(block.id)

  const outgoingEdgeIds = getBlockOutgoingEdgeIds(block)

  for (const outgoingEdgeId of outgoingEdgeIds) {
    const to = typebotsQueue[0].typebot.edges.find(
      (e) => e.id === outgoingEdgeId
    )?.to
    if (!to) continue
    const blockId =
      to.blockId ??
      typebotsQueue[0].typebot.groups.find((g) => g.id === to.groupId)
        ?.blocks[0].id
    if (!blockId) continue
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        typebotsQueue,
        blockId,
        visitedBlocks,
        currentPath,
      })
    )
  }

  for (const block of group.blocks.slice(blockIndex + 1)) {
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        typebotsQueue,
        blockId: block.id,
        visitedBlocks,
        currentPath,
      })
    )
  }

  if (outgoingEdgeIds.length > 0 || group.blocks.length !== blockIndex + 1)
    return possibleNextInputBlocks

  if (typebotsQueue.length > 1) {
    const nextEdgeId = typebotsQueue[0].edgeIdToTriggerWhenDone
    const to = typebotsQueue[1].typebot.edges.find(byId(nextEdgeId))?.to
    if (!to) return possibleNextInputBlocks
    const blockId =
      to.blockId ??
      typebotsQueue[0].typebot.groups.find((g) => g.id === to.groupId)
        ?.blocks[0].id
    if (blockId) {
      possibleNextInputBlocks.push(
        ...computePossibleNextInputBlocks({
          typebotsQueue: typebotsQueue.slice(1),
          blockId,
          visitedBlocks: {
            ...visitedBlocks,
            [typebotsQueue[1].typebot.id]: [],
          },
          currentPath,
        })
      )
    }
  }

  possibleNextInputBlocks.push(currentPath)

  return possibleNextInputBlocks
}

const getBlockOutgoingEdgeIds = (block: Block) => {
  const edgeIds: string[] = []
  if (blockHasItems(block)) {
    edgeIds.push(...block.items.map((i) => i.outgoingEdgeId).filter(isDefined))
  }
  if (block.outgoingEdgeId) edgeIds.push(block.outgoingEdgeId)
  return edgeIds
}
