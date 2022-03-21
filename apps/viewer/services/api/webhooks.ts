import {
  InputStep,
  InputStepType,
  PublicTypebot,
  ResultHeaderCell,
  Typebot,
} from 'models'
import { isInputStep, byId, parseResultHeader, isNotDefined } from 'utils'

export const parseSampleResult =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  (currentBlockId: string): Record<string, string> => {
    const header = parseResultHeader(typebot)
    const previousInputSteps = getPreviousInputSteps(typebot)({
      blockId: currentBlockId,
    })
    return {
      message: 'This is a sample result, it has been generated ⬇️',
      'Submitted at': new Date().toISOString(),
      ...parseBlocksResultSample(previousInputSteps, header),
    }
  }

const parseBlocksResultSample = (
  inputSteps: InputStep[],
  header: ResultHeaderCell[]
) =>
  header.reduce<Record<string, string>>((steps, cell) => {
    const inputStep = inputSteps.find((step) => step.id === cell.stepId)
    if (isNotDefined(inputStep)) {
      if (cell.variableId)
        return {
          ...steps,
          [cell.label]: 'content',
        }
      return steps
    }
    const value = getSampleValue(inputStep)
    return {
      ...steps,
      [cell.label]: value,
    }
  }, {})

const getSampleValue = (step: InputStep) => {
  switch (step.type) {
    case InputStepType.CHOICE:
      return step.options.isMultipleChoice
        ? step.items.map((i) => i.content).join(', ')
        : step.items[0].content ?? 'Item'
    case InputStepType.DATE:
      return new Date().toUTCString()
    case InputStepType.EMAIL:
      return 'test@email.com'
    case InputStepType.NUMBER:
      return '20'
    case InputStepType.PHONE:
      return '+33665566773'
    case InputStepType.TEXT:
      return 'answer value'
    case InputStepType.URL:
      return 'https://test.com'
  }
}

const getPreviousInputSteps =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  ({ blockId }: { blockId: string }): InputStep[] => {
    const previousInputSteps = getPreviousInputStepsInBlock(typebot)({
      blockId,
    })
    const previousBlockIds = getPreviousBlockIds(typebot)(blockId)
    return [
      ...previousInputSteps,
      ...previousBlockIds.flatMap((blockId) =>
        getPreviousInputStepsInBlock(typebot)({ blockId })
      ),
    ]
  }

const getPreviousBlockIds =
  (
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>,
    existingBlockIds?: string[]
  ) =>
  (blockId: string): string[] => {
    const previousBlocks = typebot.edges.reduce<string[]>(
      (blockIds, edge) =>
        (!existingBlockIds || !existingBlockIds.includes(edge.from.blockId)) &&
        edge.to.blockId === blockId
          ? [...blockIds, edge.from.blockId]
          : blockIds,
      []
    )
    const newBlocks = [...(existingBlockIds ?? []), ...previousBlocks]
    return previousBlocks.concat(
      previousBlocks.flatMap(getPreviousBlockIds(typebot, newBlocks))
    )
  }

const getPreviousInputStepsInBlock =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  ({ blockId, stepId }: { blockId: string; stepId?: string }) => {
    const currentBlock = typebot.blocks.find(byId(blockId))
    if (!currentBlock) return []
    const inputSteps: InputStep[] = []
    for (const step of currentBlock.steps) {
      if (step.id === stepId) break
      if (isInputStep(step)) inputSteps.push(step)
    }
    return inputSteps
  }
