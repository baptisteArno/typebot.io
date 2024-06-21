import { addEdgeToSniper, createPortalEdge } from '../../../addEdgeToSniper'
import {
  SniperLinkBlock,
  SessionState,
  Variable,
  ChatLog,
  Edge,
  sniperInSessionStateSchema,
  SniperInSession,
} from '@sniper.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { createId } from '@paralleldrive/cuid2'
import { isNotDefined, byId } from '@sniper.io/lib/utils'
import { createResultIfNotExist } from '../../../queries/createResultIfNotExist'
import prisma from '@sniper.io/lib/prisma'
import { defaultSniperLinkOptions } from '@sniper.io/schemas/features/blocks/logic/sniperLink/constants'

export const executeSniperLink = async (
  state: SessionState,
  block: SniperLinkBlock
): Promise<ExecuteLogicResponse> => {
  const logs: ChatLog[] = []
  const sniperId = block.options?.sniperId
  if (!sniperId) {
    logs.push({
      status: 'error',
      description: `Failed to link sniper`,
      details: `Sniper ID is not specified`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  const isLinkingSameSniper =
    sniperId === 'current' || sniperId === state.snipersQueue[0].sniper.id
  let newSessionState = state
  let nextGroupId: string | undefined
  if (isLinkingSameSniper) {
    newSessionState = await addSameSniperToState({ state, block })
    nextGroupId = block.options?.groupId
  } else {
    const linkedSniper = await fetchSniper(state, sniperId)
    if (!linkedSniper) {
      logs.push({
        status: 'error',
        description: `Failed to link sniper`,
        details: `Sniper with ID ${block.options?.sniperId} not found`,
      })
      return { outgoingEdgeId: block.outgoingEdgeId, logs }
    }
    newSessionState = await addLinkedSniperToState(state, block, linkedSniper)
    nextGroupId = getNextGroupId(block.options?.groupId, linkedSniper)
  }

  if (!nextGroupId) {
    logs.push({
      status: 'error',
      description: `Failed to link sniper`,
      details: `Group with ID "${block.options?.groupId}" not found`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }

  const portalEdge = createPortalEdge({ to: { groupId: nextGroupId } })

  newSessionState = addEdgeToSniper(newSessionState, portalEdge)

  return {
    outgoingEdgeId: portalEdge.id,
    newSessionState,
  }
}

const addSameSniperToState = async ({
  state,
  block,
}: {
  state: SessionState
  block: SniperLinkBlock
}) => {
  const currentSniperInQueue = state.snipersQueue[0]

  const resumeEdge = createResumeEdgeIfNecessary(state, block)

  const currentSniperWithResumeEdge = resumeEdge
    ? {
        ...currentSniperInQueue,
        sniper: {
          ...currentSniperInQueue.sniper,
          edges: [...currentSniperInQueue.sniper.edges, resumeEdge],
        },
      }
    : currentSniperInQueue

  return {
    ...state,
    snipersQueue: [
      {
        sniper: {
          ...currentSniperInQueue.sniper,
        },
        resultId: currentSniperInQueue.resultId,
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: currentSniperInQueue.answers,
        isMergingWithParent: true,
      },
      currentSniperWithResumeEdge,
      ...state.snipersQueue.slice(1),
    ],
  }
}

const addLinkedSniperToState = async (
  state: SessionState,
  block: SniperLinkBlock,
  linkedSniper: SniperInSession
): Promise<SessionState> => {
  const currentSniperInQueue = state.snipersQueue[0]

  const resumeEdge = createResumeEdgeIfNecessary(state, block)

  const currentSniperWithResumeEdge = resumeEdge
    ? {
        ...currentSniperInQueue,
        sniper: {
          ...currentSniperInQueue.sniper,
          edges: [...currentSniperInQueue.sniper.edges, resumeEdge],
        },
      }
    : currentSniperInQueue

  const shouldMergeResults =
    currentSniperInQueue.sniper.version === '6'
      ? block.options?.mergeResults ?? defaultSniperLinkOptions.mergeResults
      : block.options?.mergeResults !== false

  if (
    currentSniperInQueue.resultId &&
    currentSniperInQueue.answers.length === 0
  ) {
    await createResultIfNotExist({
      resultId: currentSniperInQueue.resultId,
      sniper: currentSniperInQueue.sniper,
      hasStarted: false,
      isCompleted: false,
    })
  }

  const isPreview = isNotDefined(currentSniperInQueue.resultId)
  return {
    ...state,
    snipersQueue: [
      {
        sniper: {
          ...linkedSniper,
          variables: fillVariablesWithExistingValues(
            linkedSniper.variables,
            state.snipersQueue
          ),
        },
        resultId: isPreview
          ? undefined
          : shouldMergeResults
          ? currentSniperInQueue.resultId
          : createId(),
        edgeIdToTriggerWhenDone: block.outgoingEdgeId ?? resumeEdge?.id,
        answers: shouldMergeResults ? currentSniperInQueue.answers : [],
        isMergingWithParent: shouldMergeResults,
      },
      currentSniperWithResumeEdge,
      ...state.snipersQueue.slice(1),
    ],
  }
}

const createResumeEdgeIfNecessary = (
  state: SessionState,
  block: SniperLinkBlock
): Edge | undefined => {
  const currentSniperInQueue = state.snipersQueue[0]
  const blockId = block.id
  if (block.outgoingEdgeId) return
  const currentGroup = currentSniperInQueue.sniper.groups.find((group) =>
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
  snipersQueue: SessionState['snipersQueue']
): Variable[] =>
  emptyVariables.map((emptyVariable) => {
    let matchedVariable
    for (const sniperInQueue of snipersQueue) {
      matchedVariable = sniperInQueue.sniper.variables.find(
        (v) => v.name === emptyVariable.name
      )
      if (matchedVariable) break
    }
    return {
      ...emptyVariable,
      value: matchedVariable?.value,
    }
  })

const fetchSniper = async (state: SessionState, sniperId: string) => {
  const { resultId } = state.snipersQueue[0]
  const isPreview = !resultId
  if (isPreview) {
    const sniper = await prisma.sniper.findUnique({
      where: { id: sniperId },
      select: {
        version: true,
        id: true,
        edges: true,
        groups: true,
        variables: true,
        events: true,
      },
    })
    return sniperInSessionStateSchema.parse(sniper)
  }
  const sniper = await prisma.publicSniper.findUnique({
    where: { sniperId },
    select: {
      version: true,
      id: true,
      edges: true,
      groups: true,
      variables: true,
      events: true,
    },
  })
  if (!sniper) return null
  return sniperInSessionStateSchema.parse({
    ...sniper,
    id: sniperId,
  })
}

const getNextGroupId = (
  groupId: string | undefined,
  sniper: SniperInSession
) => {
  if (groupId) return groupId
  if (sniper.version === '6') {
    const startEdge = sniper.edges.find(byId(sniper.events[0].outgoingEdgeId))
    return startEdge?.to.groupId
  }
  return sniper.groups.find((group) =>
    group.blocks.some((block) => block.type === 'start')
  )?.id
}
