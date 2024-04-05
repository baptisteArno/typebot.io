import { addEdgeToTypebot, createPortalEdge } from '../../../addEdgeToTypebot'
import {
  TypebotLinkBlock,
  SessionState,
  Variable,
  ChatLog,
  Edge,
  typebotInSessionStateSchema,
  TypebotInSession,
} from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { createId } from '@paralleldrive/cuid2'
import { isNotDefined, byId } from '@typebot.io/lib/utils'
import { createResultIfNotExist } from '../../../queries/createResultIfNotExist'
import prisma from '@typebot.io/lib/prisma'
import { defaultTypebotLinkOptions } from '@typebot.io/schemas/features/blocks/logic/typebotLink/constants'

export const executeTypebotLink = async (
  state: SessionState,
  block: TypebotLinkBlock
): Promise<ExecuteLogicResponse> => {
  const logs: ChatLog[] = []
  const typebotId = block.options?.typebotId
  if (!typebotId) {
    logs.push({
      status: 'error',
      description: `Failed to link typebot`,
      details: `Typebot ID is not specified`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  const isLinkingSameTypebot =
    typebotId === 'current' || typebotId === state.typebotsQueue[0].typebot.id
  let newSessionState = state
  let nextGroupId: string | undefined
  if (isLinkingSameTypebot) {
    newSessionState = await addSameTypebotToState({ state, block })
    nextGroupId = block.options?.groupId
  } else {
    const linkedTypebot = await fetchTypebot(state, typebotId)
    if (!linkedTypebot) {
      logs.push({
        status: 'error',
        description: `Failed to link typebot`,
        details: `Typebot with ID ${block.options?.typebotId} not found`,
      })
      return { outgoingEdgeId: block.outgoingEdgeId, logs }
    }
    newSessionState = await addLinkedTypebotToState(state, block, linkedTypebot)
    nextGroupId = getNextGroupId(block.options?.groupId, linkedTypebot)
  }

  if (!nextGroupId) {
    logs.push({
      status: 'error',
      description: `Failed to link typebot`,
      details: `Group with ID "${block.options?.groupId}" not found`,
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

const addSameTypebotToState = async ({
  state,
  block,
}: {
  state: SessionState
  block: TypebotLinkBlock
}) => {
  const currentTypebotInQueue = state.typebotsQueue[0]

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

  return {
    ...state,
    typebotsQueue: [
      {
        typebot: {
          ...currentTypebotInQueue.typebot,
        },
        resultId: currentTypebotInQueue.resultId,
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: currentTypebotInQueue.answers,
        isMergingWithParent: true,
      },
      currentTypebotWithResumeEdge,
      ...state.typebotsQueue.slice(1),
    ],
  }
}

const addLinkedTypebotToState = async (
  state: SessionState,
  block: TypebotLinkBlock,
  linkedTypebot: TypebotInSession
): Promise<SessionState> => {
  const currentTypebotInQueue = state.typebotsQueue[0]

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
    currentTypebotInQueue.typebot.version === '6'
      ? block.options?.mergeResults ?? defaultTypebotLinkOptions.mergeResults
      : block.options?.mergeResults !== false

  if (
    currentTypebotInQueue.resultId &&
    currentTypebotInQueue.answers.length === 0
  ) {
    await createResultIfNotExist({
      resultId: currentTypebotInQueue.resultId,
      typebot: currentTypebotInQueue.typebot,
      hasStarted: false,
      isCompleted: false,
    })
  }

  const isPreview = isNotDefined(currentTypebotInQueue.resultId)
  return {
    ...state,
    typebotsQueue: [
      {
        typebot: {
          ...linkedTypebot,
          variables: fillVariablesWithExistingValues(
            linkedTypebot.variables,
            state.typebotsQueue
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
      blockId: '',
    },
    to: {
      groupId: currentGroup.id,
      blockId: nextBlockInGroup.id,
    },
  }
}

const fillVariablesWithExistingValues = (
  emptyVariables: Variable[],
  typebotsQueue: SessionState['typebotsQueue']
): Variable[] =>
  emptyVariables.map((emptyVariable) => {
    let matchedVariable
    for (const typebotInQueue of typebotsQueue) {
      matchedVariable = typebotInQueue.typebot.variables.find(
        (v) => v.name === emptyVariable.name
      )
      if (matchedVariable) break
    }
    return {
      ...emptyVariable,
      value: matchedVariable?.value,
    }
  })

const fetchTypebot = async (state: SessionState, typebotId: string) => {
  const { resultId } = state.typebotsQueue[0]
  const isPreview = !resultId
  if (isPreview) {
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      select: {
        version: true,
        id: true,
        edges: true,
        groups: true,
        variables: true,
        events: true,
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
      events: true,
    },
  })
  if (!typebot) return null
  return typebotInSessionStateSchema.parse({
    ...typebot,
    id: typebotId,
  })
}

const getNextGroupId = (
  groupId: string | undefined,
  typebot: TypebotInSession
) => {
  if (groupId) return groupId
  if (typebot.version === '6') {
    const startEdge = typebot.edges.find(byId(typebot.events[0].outgoingEdgeId))
    return startEdge?.to.groupId
  }
  return typebot.groups.find((group) =>
    group.blocks.some((block) => block.type === 'start')
  )?.id
}
