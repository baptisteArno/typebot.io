import {
  Typebot,
  Block,
  Edge,
  OctaBubbleStepType,
  OctaStepType,
  WOZStepType,
  InputStepType,
  LogicStepType,
  IntegrationStepType,
  OctaWabaStepType,
} from 'models'

const finalSteps: string[] = [
  OctaStepType.ASSIGN_TO_TEAM,
  OctaBubbleStepType.END_CONVERSATION,
  WOZStepType.MESSAGE,
]

const validIfHasConnection = (
  blockId: string,
  side: 'from' | 'to',
  edges: Edge[]
) => !!edges.find((edge) => edge[side].blockId === blockId)

const areAllItemsConnected = (block: Block): boolean => {
  let result = false
  block.steps.forEach((step) => {
    const checkStepType =
      step.type === InputStepType.CHOICE ||
      step.type === IntegrationStepType.WEBHOOK ||
      step.type === OctaStepType.OFFICE_HOURS ||
      step.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST ||
      step.type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST ||
      step.type === WOZStepType.ASSIGN

    if (checkStepType) {
      const areAllChoicesConnected =
        step?.items?.every((item) => !!item.outgoingEdgeId) ?? false
      if (!!areAllChoicesConnected) {
        result = true
      }
    }
  })
  return result
}

const hasAllEdgeCaseTrue = (block: Block): boolean => {
  let result = true
  block.steps.forEach((step) => {
    if (step.type === LogicStepType.CONDITION) {
      const hasEdgeCaseTrue = !!step.outgoingEdgeId
      const hasEdgeCaseFalse =
        step.items?.every((item) => !!item.outgoingEdgeId) ?? false
      if (!hasEdgeCaseTrue || !hasEdgeCaseFalse) {
        result = false
      }
    }
  })
  return result
}

const checkOutgoingEdgeOnAssignToTeam = (block: Block): boolean => {
  let result = true
  block.steps.forEach((step) => {
    if (step.type === OctaStepType.ASSIGN_TO_TEAM) {
      if (step.options?.isAvailable) {
        result = !!step.outgoingEdgeId
      }
    }
  })
  return result
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

  const parsedBlocks = blocks.map((block, blockIndex) => {
    const blockTypes = block.steps.map((s) => s.type)

    const hasToConnection = validIfHasConnection(block.id, 'to', edges)
    const hasFromConnection = validIfHasConnection(block.id, 'from', edges)

    block.hasConnection =
      blockIndex === 0
        ? !!edges.find((edge) => edge.from.blockId === block.id)
        : hasToConnection && hasFromConnection

    const isFinalStep = blockTypes
      .map((v) => finalSteps.includes(v))
      .some((v) => !!v)

    if (isFinalStep) {
      block.hasConnection = validIfHasConnection(block.id, 'to', edges)
    }

    const hasToConnectEachItem =
      blockTypes.includes(InputStepType.CHOICE) ||
      blockTypes.includes(IntegrationStepType.WEBHOOK) ||
      blockTypes.includes(OctaStepType.OFFICE_HOURS) ||
      blockTypes.includes(OctaWabaStepType.WHATSAPP_OPTIONS_LIST) ||
      blockTypes.includes(OctaWabaStepType.WHATSAPP_BUTTONS_LIST) ||
      blockTypes.includes(WOZStepType.ASSIGN)

    if (hasToConnectEachItem) {
      block.hasConnection = areAllItemsConnected(block)
    }

    if (blockTypes.includes(LogicStepType.CONDITION)) {
      block.hasConnection = hasAllEdgeCaseTrue(block)
    }

    if (blockTypes.includes(OctaStepType.ASSIGN_TO_TEAM)) {
      block.hasConnection =
        checkOutgoingEdgeOnAssignToTeam(block) &&
        validIfHasConnection(block.id, 'to', edges)
    }

    return block
  })

  return parsedBlocks
}
