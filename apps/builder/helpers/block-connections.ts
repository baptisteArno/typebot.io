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
  Step,
} from 'models'

const finalSteps: string[] = [
  OctaBubbleStepType.END_CONVERSATION,
  WOZStepType.MESSAGE,
]

const validIfHasConnection = (
  blockId: string,
  side: 'from' | 'to',
  edges: Edge[]
) => !!edges.find((edge) => edge[side].blockId === blockId)

const areAllItemsConnected = (step: Step): boolean => {
  let result = false
  const areAllChoicesConnected =
    step?.items?.every((item) => !!item.outgoingEdgeId) ?? false
  if (!!areAllChoicesConnected) {
    result = true
  }
  return result
}

const hasAllEdgeCaseTrue = (step: Step, block: Block): boolean => {
  let result = true
  const isThereNextStep = !!block.steps[block.steps.indexOf(step) + 1]
  const hasEdgeCaseTrue = isThereNextStep || !!step.outgoingEdgeId
  const hasEdgeCaseFalse =
    step.items?.every((item) => !!item.outgoingEdgeId) ?? false
  if (!hasEdgeCaseTrue || !hasEdgeCaseFalse) {
    result = false
  }
  return result
}

const checkOutgoingEdgeOnAssignToTeam = (step: Step): boolean => {
  let result = true
  if (step.options?.isAvailable) {
    result = !!step.outgoingEdgeId
  }
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
    const hasToConnection = validIfHasConnection(block.id, 'to', edges)
    const hasFromConnection = validIfHasConnection(block.id, 'from', edges)
    block.hasConnection = true
    block.steps.forEach((step, stepIndex) => {
      const isInitialStep = blockIndex === 0
      if (isInitialStep) {
        if (!hasFromConnection) {
          block.hasConnection = false
        }
        return
      }

      const isFinalStep = finalSteps.includes(step.type)
      if (isFinalStep) {
        if (!hasToConnection) {
          block.hasConnection = false
        }
        return
      }

      const hasToConnectEachItem =
        step.type === InputStepType.CHOICE ||
        step.type === IntegrationStepType.WEBHOOK ||
        step.type === OctaStepType.OFFICE_HOURS ||
        step.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST ||
        step.type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST ||
        step.type === WOZStepType.ASSIGN

      if (hasToConnectEachItem) {
        if (!areAllItemsConnected(step)) {
          block.hasConnection = false
        }
        return
      }

      if (step.type === LogicStepType.CONDITION) {
        if (!(hasAllEdgeCaseTrue(step, block) && hasToConnection)) {
          block.hasConnection = false
        }
        return
      }

      if (step.type === OctaStepType.ASSIGN_TO_TEAM) {
        if (!(checkOutgoingEdgeOnAssignToTeam(step) && hasToConnection)) {
          block.hasConnection = false
        }
        return
      }

      const isThereConditionalBlockBeforeMe = block.steps.some(
        (s, index) => s.type === LogicStepType.CONDITION && index < stepIndex
      )

      if (
        isThereConditionalBlockBeforeMe &&
        block.steps.length === stepIndex + 1
      ) {
        if (!step.outgoingEdgeId) {
          block.hasConnection = false
        }
        return
      }

      const lastStep = block.steps[block.steps.length - 1]
      const isLastStepFinalStep =
        finalSteps.includes(lastStep?.type) ||
        (lastStep.type === OctaStepType.ASSIGN_TO_TEAM &&
          !lastStep?.options?.isAvailable)

      if (!(hasToConnection && hasFromConnection) && !isLastStepFinalStep) {
        block.hasConnection = false
      }
    })
    return block
  })

  return parsedBlocks
}
