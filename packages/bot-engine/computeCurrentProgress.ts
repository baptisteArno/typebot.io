import { isDefined, byId } from '@sniper.io/lib'
import {
  getBlockById,
  blockHasItems,
  isInputBlock,
} from '@sniper.io/schemas/helpers'
import { Block, SessionState } from '@sniper.io/schemas'

type Props = {
  snipersQueue: SessionState['snipersQueue']
  progressMetadata: NonNullable<SessionState['progressMetadata']>
  currentInputBlockId: string | undefined
}

export const computeCurrentProgress = ({
  snipersQueue,
  progressMetadata,
  currentInputBlockId,
}: Props) => {
  if (!currentInputBlockId) return
  const paths = computePossibleNextInputBlocks({
    snipersQueue: snipersQueue,
    blockId: currentInputBlockId,
    visitedBlocks: {
      [snipersQueue[0].sniper.id]: [],
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
  snipersQueue,
  blockId,
  visitedBlocks,
}: {
  currentPath: string[]
  snipersQueue: SessionState['snipersQueue']
  blockId: string
  visitedBlocks: {
    [key: string]: string[]
  }
}): string[][] => {
  if (visitedBlocks[snipersQueue[0].sniper.id].includes(blockId)) return []
  visitedBlocks[snipersQueue[0].sniper.id].push(blockId)

  const possibleNextInputBlocks: string[][] = []

  const { block, group, blockIndex } = getBlockById(
    blockId,
    snipersQueue[0].sniper.groups
  )

  if (isInputBlock(block)) currentPath.push(block.id)

  const outgoingEdgeIds = getBlockOutgoingEdgeIds(block)

  for (const outgoingEdgeId of outgoingEdgeIds) {
    const to = snipersQueue[0].sniper.edges.find(
      (e) => e.id === outgoingEdgeId
    )?.to
    if (!to) continue
    const blockId =
      to.blockId ??
      snipersQueue[0].sniper.groups.find((g) => g.id === to.groupId)?.blocks[0]
        .id
    if (!blockId) continue
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        snipersQueue,
        blockId,
        visitedBlocks,
        currentPath,
      })
    )
  }

  for (const block of group.blocks.slice(blockIndex + 1)) {
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        snipersQueue,
        blockId: block.id,
        visitedBlocks,
        currentPath,
      })
    )
  }

  if (outgoingEdgeIds.length > 0 || group.blocks.length !== blockIndex + 1)
    return possibleNextInputBlocks

  if (snipersQueue.length > 1) {
    const nextEdgeId = snipersQueue[0].edgeIdToTriggerWhenDone
    const to = snipersQueue[1].sniper.edges.find(byId(nextEdgeId))?.to
    if (!to) return possibleNextInputBlocks
    const blockId =
      to.blockId ??
      snipersQueue[0].sniper.groups.find((g) => g.id === to.groupId)?.blocks[0]
        .id
    if (blockId) {
      possibleNextInputBlocks.push(
        ...computePossibleNextInputBlocks({
          snipersQueue: snipersQueue.slice(1),
          blockId,
          visitedBlocks: {
            ...visitedBlocks,
            [snipersQueue[1].sniper.id]: [],
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
