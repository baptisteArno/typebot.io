import {
  addEdgeToTypebot,
  createPortalEdge,
} from '@/features/chat/helpers/addEdgeToTypebot'
import prisma from '@/lib/prisma'
import {
  TypebotLinkBlock,
  SessionState,
  TypebotInSession,
  Variable,
} from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { ExecuteLogicResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'

export const executeTypebotLink = async (
  state: SessionState,
  block: TypebotLinkBlock
): Promise<ExecuteLogicResponse> => {
  if (!block.options.typebotId) {
    state.result &&
      saveErrorLog({
        resultId: state.result.id,
        message: 'Failed to link typebot',
        details: 'Typebot ID is not specified',
      })
    return { outgoingEdgeId: block.outgoingEdgeId }
  }
  const linkedTypebot = await getLinkedTypebot(state, block.options.typebotId)
  if (!linkedTypebot) {
    state.result &&
      saveErrorLog({
        resultId: state.result.id,
        message: 'Failed to link typebot',
        details: `Typebot with ID ${block.options.typebotId} not found`,
      })
    return { outgoingEdgeId: block.outgoingEdgeId }
  }
  let newSessionState = addLinkedTypebotToState(state, block, linkedTypebot)

  const nextGroupId =
    block.options.groupId ??
    linkedTypebot.groups.find((b) => b.blocks.some((s) => s.type === 'start'))
      ?.id
  if (!nextGroupId) {
    state.result &&
      saveErrorLog({
        resultId: state.result.id,
        message: 'Failed to link typebot',
        details: `Group with ID "${block.options.groupId}" not found`,
      })
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const portalEdge = createPortalEdge({ to: { groupId: nextGroupId } })

  newSessionState = addEdgeToTypebot(newSessionState, portalEdge)

  return {
    outgoingEdgeId: portalEdge.id,
    newSessionState,
  }
}

const addLinkedTypebotToState = (
  state: SessionState,
  block: TypebotLinkBlock,
  linkedTypebot: TypebotInSession
): SessionState => {
  const incomingVariables = fillVariablesWithExistingValues(
    linkedTypebot.variables,
    state.typebot.variables
  )
  return {
    ...state,
    typebot: {
      ...state.typebot,
      groups: [...state.typebot.groups, ...linkedTypebot.groups],
      variables: [...state.typebot.variables, ...incomingVariables],
      edges: [...state.typebot.edges, ...linkedTypebot.edges],
    },
    linkedTypebots: {
      typebots: [
        ...state.linkedTypebots.typebots.filter(
          (existingTypebots) => existingTypebots.id !== linkedTypebot.id
        ),
      ],
      queue: block.outgoingEdgeId
        ? [
            ...state.linkedTypebots.queue,
            { edgeId: block.outgoingEdgeId, typebotId: state.currentTypebotId },
          ]
        : state.linkedTypebots.queue,
    },
    currentTypebotId: linkedTypebot.id,
  }
}

const fillVariablesWithExistingValues = (
  variables: Variable[],
  variablesWithValues: Variable[]
): Variable[] =>
  variables.map((variable) => {
    const matchedVariable = variablesWithValues.find(
      (variableWithValue) => variableWithValue.name === variable.name
    )

    return {
      ...variable,
      value: matchedVariable?.value ?? variable.value,
    }
  })

const getLinkedTypebot = async (
  state: SessionState,
  typebotId: string
): Promise<TypebotInSession | null> => {
  const { typebot, result } = state
  const isPreview = !result.id
  if (typebotId === 'current') return typebot
  const availableTypebots =
    'linkedTypebots' in state
      ? [typebot, ...state.linkedTypebots.typebots]
      : [typebot]
  const linkedTypebot =
    availableTypebots.find(byId(typebotId)) ??
    (await fetchTypebot(isPreview, typebotId))
  return linkedTypebot
}

const fetchTypebot = async (
  isPreview: boolean,
  typebotId: string
): Promise<TypebotInSession | null> => {
  if (isPreview) {
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      select: {
        id: true,
        edges: true,
        groups: true,
        variables: true,
      },
    })
    return typebot as TypebotInSession
  }
  const typebot = await prisma.publicTypebot.findUnique({
    where: { typebotId },
    select: {
      id: true,
      edges: true,
      groups: true,
      variables: true,
    },
  })
  if (!typebot) return null
  return {
    ...typebot,
    id: typebotId,
  } as TypebotInSession
}
