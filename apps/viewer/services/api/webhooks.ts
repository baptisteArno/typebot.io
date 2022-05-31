import {
  InputStep,
  InputStepType,
  LogicStepType,
  PublicTypebot,
  ResultHeaderCell,
  Step,
  Typebot,
  TypebotLinkStep,
} from 'models'
import { isInputStep, byId, parseResultHeader, isNotDefined } from 'utils'

export const parseSampleResult =
  (
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async (
    currentBlockId: string
  ): Promise<Record<string, string | boolean | undefined>> => {
    const header = parseResultHeader({
      blocks: [...typebot.blocks, ...linkedTypebots.flatMap((t) => t.blocks)],
      variables: [
        ...typebot.variables,
        ...linkedTypebots.flatMap((t) => t.variables),
      ],
    })
    const linkedInputSteps = await extractLinkedInputSteps(
      typebot,
      linkedTypebots
    )(currentBlockId)

    return {
      message: 'This is a sample result, it has been generated ⬇️',
      'Submitted at': new Date().toISOString(),
      ...parseBlocksResultSample(linkedInputSteps, header),
    }
  }

const extractLinkedInputSteps =
  (
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async (
    currentBlockId?: string,
    direction: 'backward' | 'forward' = 'backward'
  ): Promise<InputStep[]> => {
    const previousLinkedTypebotSteps = walkEdgesAndExtract(
      'linkedBot',
      direction,
      typebot
    )({
      blockId: currentBlockId,
    }) as TypebotLinkStep[]

    const linkedBotInputs =
      previousLinkedTypebotSteps.length > 0
        ? await Promise.all(
            previousLinkedTypebotSteps.map((linkedBot) =>
              extractLinkedInputSteps(
                linkedTypebots.find((t) =>
                  'typebotId' in t
                    ? t.typebotId === linkedBot.options.typebotId
                    : t.id === linkedBot.options.typebotId
                ) as Typebot | PublicTypebot,
                linkedTypebots
              )(linkedBot.options.blockId, 'forward')
            )
          )
        : []

    return (
      walkEdgesAndExtract(
        'input',
        direction,
        typebot
      )({
        blockId: currentBlockId,
      }) as InputStep[]
    ).concat(linkedBotInputs.flatMap((l) => l))
  }

const parseBlocksResultSample = (
  inputSteps: InputStep[],
  header: ResultHeaderCell[]
) =>
  header.reduce<Record<string, string | boolean | undefined>>((steps, cell) => {
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
        : step.items[0]?.content ?? 'Item'
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

const walkEdgesAndExtract =
  (
    type: 'input' | 'linkedBot',
    direction: 'backward' | 'forward',
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>
  ) =>
  ({ blockId }: { blockId?: string }): Step[] => {
    const currentBlockId =
      blockId ??
      (typebot.blocks.find((b) => b.steps[0].type === 'start')?.id as string)
    const stepsInBlock = extractStepsInBlock(
      type,
      typebot
    )({
      blockId: currentBlockId,
    })
    const otherBlockIds = getBlockIds(typebot, direction)(currentBlockId)
    return [
      ...stepsInBlock,
      ...otherBlockIds.flatMap((blockId) =>
        extractStepsInBlock(type, typebot)({ blockId })
      ),
    ]
  }

const getBlockIds =
  (
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>,
    direction: 'backward' | 'forward',
    existingBlockIds?: string[]
  ) =>
  (blockId: string): string[] => {
    const blocks = typebot.edges.reduce<string[]>((blockIds, edge) => {
      if (direction === 'forward')
        return (!existingBlockIds ||
          !existingBlockIds?.includes(edge.to.blockId)) &&
          edge.from.blockId === blockId
          ? [...blockIds, edge.to.blockId]
          : blockIds
      return (!existingBlockIds ||
        !existingBlockIds.includes(edge.from.blockId)) &&
        edge.to.blockId === blockId
        ? [...blockIds, edge.from.blockId]
        : blockIds
    }, [])
    const newBlocks = [...(existingBlockIds ?? []), ...blocks]
    return blocks.concat(
      blocks.flatMap(getBlockIds(typebot, direction, newBlocks))
    )
  }

const extractStepsInBlock =
  (
    type: 'input' | 'linkedBot',
    typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>
  ) =>
  ({ blockId, stepId }: { blockId: string; stepId?: string }) => {
    const currentBlock = typebot.blocks.find(byId(blockId))
    if (!currentBlock) return []
    const steps: Step[] = []
    for (const step of currentBlock.steps) {
      if (step.id === stepId) break
      if (type === 'input' && isInputStep(step)) steps.push(step)
      if (type === 'linkedBot' && step.type === LogicStepType.TYPEBOT_LINK)
        steps.push(step)
    }
    return steps
  }
