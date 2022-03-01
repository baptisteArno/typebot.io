import { Block, InputStep, InputStepType, PublicTypebot, Typebot } from 'models'
import { isInputStep, byId, isDefined } from 'utils'

export const parseSampleResult =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  (currentBlockId: string): Record<string, string> => {
    const previousBlocks = (typebot.blocks as Block[]).filter((b) =>
      getPreviousBlockIds(typebot)(currentBlockId).includes(b.id)
    )
    const parsedBlocks = parseBlocksResultSample(typebot, previousBlocks)
    return {
      message: 'This is a sample result, it has been generated ⬇️',
      'Submitted at': new Date().toISOString(),
      ...parsedBlocks,
      ...parseVariablesHeaders(typebot, parsedBlocks),
    }
  }

const parseBlocksResultSample = (
  typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables'>,
  blocks: Block[]
) =>
  blocks
    .filter((block) => typebot && block.steps.some((step) => isInputStep(step)))
    .reduce<Record<string, string>>((blocks, block) => {
      const inputStep = block.steps.find((step) => isInputStep(step))
      if (!inputStep || !isInputStep(inputStep)) return blocks
      const matchedVariableName =
        inputStep.options.variableId &&
        typebot.variables.find(byId(inputStep.options.variableId))?.name
      const value = getSampleValue(inputStep)
      return {
        ...blocks,
        [matchedVariableName ?? block.title]: value,
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

const parseVariablesHeaders = (
  typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables'>,
  parsedBlocks: Record<string, string>
) =>
  typebot.variables.reduce<Record<string, string>>((headers, v) => {
    if (parsedBlocks[v.name]) return headers
    return {
      ...headers,
      [v.name]: 'value',
    }
  }, {})

const getPreviousBlockIds =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  (blockId: string): string[] => {
    const previousBlocks = typebot.edges
      .map((edge) =>
        edge.to.blockId === blockId ? edge.from.blockId : undefined
      )
      .filter(isDefined)
    return previousBlocks.concat(
      previousBlocks.flatMap(getPreviousBlockIds(typebot))
    )
  }
