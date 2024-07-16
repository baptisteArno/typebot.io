import { byId, isDefined, isNotDefined } from '@typebot.io/lib'
import { Group, SessionState, VariableWithValue } from '@typebot.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { VisitedEdge } from '@typebot.io/prisma'

export type NextGroup = {
  group?: Group
  newSessionState: SessionState
  visitedEdge?: VisitedEdge
}

export const getNextGroup = async ({
  state,
  edgeId,
  isOffDefaultPath,
}: {
  state: SessionState
  edgeId?: string
  isOffDefaultPath: boolean
}): Promise<NextGroup> => {
  const nextEdge = state.typebotsQueue[0].typebot.edges.find(byId(edgeId))
  if (!nextEdge) {
    if (state.typebotsQueue.length > 1) {
      const nextEdgeId = state.typebotsQueue[0].edgeIdToTriggerWhenDone
      const isMergingWithParent = state.typebotsQueue[0].isMergingWithParent
      const currentResultId = state.typebotsQueue[0].resultId
      if (!isMergingWithParent && currentResultId)
        await upsertResult({
          resultId: currentResultId,
          typebot: state.typebotsQueue[0].typebot,
          isCompleted: true,
          hasStarted: state.typebotsQueue[0].answers.length > 0,
        })
      let newSessionState = {
        ...state,
        typebotsQueue: [
          {
            ...state.typebotsQueue[1],
            typebot: isMergingWithParent
              ? {
                  ...state.typebotsQueue[1].typebot,
                  variables: state.typebotsQueue[1].typebot.variables
                    .map((variable) => ({
                      ...variable,
                      value:
                        state.typebotsQueue[0].typebot.variables.find(
                          (v) => v.name === variable.name
                        )?.value ?? variable.value,
                    }))
                    .concat(
                      state.typebotsQueue[0].typebot.variables.filter(
                        (variable) =>
                          isDefined(variable.value) &&
                          isNotDefined(
                            state.typebotsQueue[1].typebot.variables.find(
                              (v) => v.name === variable.name
                            )
                          )
                      ) as VariableWithValue[]
                    ),
                }
              : state.typebotsQueue[1].typebot,
            answers: isMergingWithParent
              ? [
                  ...state.typebotsQueue[1].answers.filter(
                    (incomingAnswer) =>
                      !state.typebotsQueue[0].answers.find(
                        (currentAnswer) =>
                          currentAnswer.key === incomingAnswer.key
                      )
                  ),
                  ...state.typebotsQueue[0].answers,
                ]
              : state.typebotsQueue[1].answers,
          },
          ...state.typebotsQueue.slice(2),
        ],
      } satisfies SessionState
      if (state.progressMetadata)
        newSessionState.progressMetadata = {
          ...state.progressMetadata,
          totalAnswers:
            state.progressMetadata.totalAnswers +
            state.typebotsQueue[0].answers.length,
        }
      const nextGroup = await getNextGroup({
        state: newSessionState,
        edgeId: nextEdgeId,
        isOffDefaultPath,
      })
      newSessionState = nextGroup.newSessionState
      if (!nextGroup)
        return {
          newSessionState,
        }
      return {
        ...nextGroup,
        newSessionState,
      }
    }
    return {
      newSessionState: state,
    }
  }
  const nextGroup = state.typebotsQueue[0].typebot.groups.find(
    byId(nextEdge.to.groupId)
  )
  if (!nextGroup)
    return {
      newSessionState: state,
    }
  const startBlockIndex = nextEdge.to.blockId
    ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
    : 0
  const currentVisitedEdgeIndex = isOffDefaultPath
    ? (state.currentVisitedEdgeIndex ?? -1) + 1
    : state.currentVisitedEdgeIndex
  const resultId = state.typebotsQueue[0].resultId
  return {
    group: {
      ...nextGroup,
      blocks: nextGroup.blocks.slice(startBlockIndex),
    } as Group,
    newSessionState: {
      ...state,
      currentVisitedEdgeIndex,
      previewMetadata:
        resultId || !isOffDefaultPath
          ? state.previewMetadata
          : {
              ...state.previewMetadata,
              visitedEdges: (state.previewMetadata?.visitedEdges ?? []).concat(
                nextEdge.id
              ),
            },
    },
    visitedEdge:
      resultId && isOffDefaultPath && !nextEdge.id.startsWith('virtual-')
        ? {
            index: currentVisitedEdgeIndex as number,
            edgeId: nextEdge.id,
            resultId,
          }
        : undefined,
  }
}
