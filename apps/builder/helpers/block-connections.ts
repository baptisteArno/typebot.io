import { Typebot, Block, Edge } from 'models'

const validIfHasConnection = (
  blockId: string,
  side: 'from' | 'to',
  edges: Edge[]
) => !!edges.find((edge) => edge[side].blockId === blockId)

const blocksWithOutConnection = (blocks: Block[]) =>
  blocks.filter((item) => !item.hasConnection)

const updateOneOnlyBlockWithoutConnection = ({
  parsedBlocks,
  edges,
}: {
  parsedBlocks: Block[]
  edges: Edge[]
}) => {
  const singleBlockWithoutConnection = blocksWithOutConnection(
    parsedBlocks
  ).find((item) => item.hasConnection === false)

  if (singleBlockWithoutConnection) {
    parsedBlocks = parsedBlocks.map((block) => {
      if (block.id === singleBlockWithoutConnection.id) {
        block.hasConnection =
          validIfHasConnection(block.id, 'from', edges) ||
          validIfHasConnection(block.id, 'to', edges)
      }

      return block
    })
  }

  return parsedBlocks
}

const findTargetBlock = (
  startEdge: Edge,
  targetBlockIds: string[],
  edges: Edge[]
): boolean => {
  if (!startEdge) {
    return false
  }

  if (targetBlockIds.includes(startEdge.from.blockId)) {
    return true
  }

  const nextEdge = edges.find(
    (edge) => edge.to.blockId === startEdge.from.blockId
  )

  if (nextEdge) {
    return findTargetBlock(nextEdge, targetBlockIds, edges)
  }

  return false
}

const updateBlocksCanReachMultiConnections = ({
  blocks,
  parsedBlocks,
  edges,
}: {
  blocks: Block[]
  parsedBlocks: Block[]
  edges: Edge[]
}) => {
  const blocksWithMultiConnections = blocks
    .filter(
      (item) =>
        !!item.steps.filter((step) =>
          [
            'choice input',
            'whatsapp options list',
            'whatsapp buttons list',
          ].includes(step.type)
        )?.length
    )
    ?.map((block) => block.id)

  blocksWithOutConnection(parsedBlocks).forEach((block) => {
    const startEdge = edges.find((edge) => edge.to.blockId === block.id)

    if (startEdge) {
      const canReachMultiConnectionBlocks = findTargetBlock(
        startEdge,
        blocksWithMultiConnections,
        edges
      )

      if (canReachMultiConnectionBlocks) {
        parsedBlocks = parsedBlocks.map((parsedBlock) => {
          if (parsedBlock.id === block.id) {
            parsedBlock.hasConnection = true
          }

          return parsedBlock
        })
      }
    }
  })

  return parsedBlocks
}

export const updateBlocksHasConnections = ({
  blocks,
  edges,
}: Typebot): Block[] => {
  if (blocks.length <= 1) {
    return blocks.map((block) => ({
      ...block,
      hasConnection: true,
    }))
  }

  let parsedBlocks = blocks.map((block, blockIndex) => {
    if (blockIndex === 0) {
      block.hasConnection = !!edges.find(
        (edge) => edge.from.blockId === block.id
      )
    } else {
      const hasToConnection = validIfHasConnection(block.id, 'to', edges)

      const fromEdge = edges.find((edge) => edge.to.blockId === block.id)

      if (fromEdge?.from?.itemId) {
        block.hasConnection = hasToConnection
      } else {
        block.hasConnection =
          validIfHasConnection(block.id, 'from', edges) && hasToConnection
      }
    }

    return block
  })

  if (blocksWithOutConnection(parsedBlocks).length === 1) {
    parsedBlocks = updateOneOnlyBlockWithoutConnection({
      parsedBlocks,
      edges,
    })
  } else {
    parsedBlocks = updateBlocksCanReachMultiConnections({
      blocks,
      parsedBlocks,
      edges,
    })
  }

  return parsedBlocks
}
