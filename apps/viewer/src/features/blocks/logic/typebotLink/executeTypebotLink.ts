import {
  addEdgeToTypebot,
  createPortalEdge,
} from '@/features/chat/helpers/addEdgeToTypebot'
import prisma from '@/lib/prisma'
import {
  TypebotLinkBlock,
  SessionState,
  Variable,
  ReplyLog,
  VariableWithValue,
  Edge,
  typebotInSessionStateSchema,
  TypebotInSession,
} from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { createId } from '@paralleldrive/cuid2'
import { isDefined, isNotDefined } from '@typebot.io/lib/utils'
import { createResultIfNotExist } from '@/features/chat/queries/createResultIfNotExist'

export const executeTypebotLink = async (
  state: SessionState,
  block: TypebotLinkBlock
): Promise<ExecuteLogicResponse> => {
  const logs: ReplyLog[] = []
  const typebotId = block.options.typebotId
  if (!typebotId) {
    logs.push({
      status: 'error',
      description: `Failed to link typebot`,
      details: `Typebot ID is not specified`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  const linkedTypebot = await fetchTypebot(state, typebotId)
  if (!linkedTypebot) {
    logs.push({
      status: 'error',
      description: `Failed to link typebot`,
      details: `Typebot with ID ${block.options.typebotId} not found`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  let newSessionState = await addLinkedTypebotToState(
    state,
    block,
    linkedTypebot
  )

  const nextGroupId =
    block.options.groupId ??
    linkedTypebot.groups.find((group) =>
      group.blocks.some((block) => block.type === 'start')
    )?.id
  if (!nextGroupId) {
    logs.push({
      status: 'error',
      description: `Failed to link typebot`,
      details: `Group with ID "${block.options.groupId}" not found`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }

  const portalEdge = createPortalEdge({ to: { groupId: nextGroupId } })

  newSessionState = addEdgeToTypebot(newSessionState, portalEdge)

  return {
    outgoingEdgeId: portalEdge.id,
    newSessionState,
  }
}

const addLinkedTypebotToState = async (
  state: SessionState,
  block: TypebotLinkBlock,
  linkedTypebot: TypebotInSession
): Promise<SessionState> => {
  const currentTypebotInQueue = state.typebotsQueue[0]
  const isPreview = isNotDefined(currentTypebotInQueue.resultId)

  const resumeEdge = createResumeEdgeIfNecessary(state, block)

  const currentTypebotWithResumeEdge = resumeEdge
    ? {
        ...currentTypebotInQueue,
        typebot: {
          ...currentTypebotInQueue.typebot,
          edges: [...currentTypebotInQueue.typebot.edges, resumeEdge],
        },
      }
    : currentTypebotInQueue

  const shouldMergeResults =
    block.options.mergeResults !== false ||
    currentTypebotInQueue.typebot.id === linkedTypebot.id ||
    block.options.typebotId === 'current'

  if (
    currentTypebotInQueue.resultId &&
    currentTypebotInQueue.answers.length === 0 &&
    shouldMergeResults
  ) {
    await createResultIfNotExist({
      resultId: currentTypebotInQueue.resultId,
      typebot: currentTypebotInQueue.typebot,
      hasStarted: false,
      isCompleted: false,
    })
  }

  return {
    ...state,
    typebotsQueue: [
      {
        typebot: {
          ...linkedTypebot,
          variables: fillVariablesWithExistingValues(
            linkedTypebot.variables,
            currentTypebotInQueue.typebot.variables
          ),
        },
        resultId: isPreview
          ? undefined
          : shouldMergeResults
          ? currentTypebotInQueue.resultId
          : createId(),
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: shouldMergeResults ? currentTypebotInQueue.answers : [],
        isMergingWithParent: shouldMergeResults,
      },
      currentTypebotWithResumeEdge,
      ...state.typebotsQueue.slice(1),
    ],
  }
}

const createResumeEdgeIfNecessary = (
  state: SessionState,
  block: TypebotLinkBlock
): Edge | undefined => {
  const currentTypebotInQueue = state.typebotsQueue[0]
  const blockId = block.id
  if (block.outgoingEdgeId) return
  const currentGroup = currentTypebotInQueue.typebot.groups.find((group) =>
    group.blocks.some((block) => block.id === blockId)
  )
  if (!currentGroup) return
  const currentBlockIndex = currentGroup.blocks.findIndex(
    (block) => block.id === blockId
  )
  const nextBlockInGroup =
    currentBlockIndex === -1
      ? undefined
      : currentGroup.blocks[currentBlockIndex + 1]
  if (!nextBlockInGroup) return
  return {
    id: createId(),
    from: {
      groupId: '',
      blockId: '',
    },
    to: {
      groupId: nextBlockInGroup.groupId,
      blockId: nextBlockInGroup.id,
    },
  }
}

const fillVariablesWithExistingValues = (
  variables: Variable[],
  variablesWithValues: Variable[]
): VariableWithValue[] =>
  variables
    .map((variable) => {
      const matchedVariable = variablesWithValues.find(
        (variableWithValue) => variableWithValue.name === variable.name
      )

      return {
        ...variable,
        value: matchedVariable?.value,
      }
    })
    .filter((variable) => isDefined(variable.value)) as VariableWithValue[]

const fetchTypebot = async (state: SessionState, typebotId: string) => {
  const { typebot: typebotInState, resultId } = state.typebotsQueue[0]
  const isPreview = !resultId
  if (typebotId === 'current') return typebotInState
  if (isPreview) {
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      select: {
        version: true,
        id: true,
        edges: true,
        groups: true,
        variables: true,
      },
    })
    return typebotInSessionStateSchema.parse(typebot)
  }
  const typebot = await prisma.publicTypebot.findUnique({
    where: { typebotId },
    select: {
      version: true,
      id: true,
      edges: true,
      groups: true,
      variables: true,
    },
  })
  if (!typebot) return null
  return typebotInSessionStateSchema.parse({
    ...typebot,
    id: typebotId,
  })
}
