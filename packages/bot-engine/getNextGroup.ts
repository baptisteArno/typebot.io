import { byId, isDefined, isNotDefined } from '@sniper.io/lib'
import { Group, SessionState, VariableWithValue } from '@sniper.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { VisitedEdge } from '@sniper.io/prisma'

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
  const nextEdge = state.snipersQueue[0].sniper.edges.find(byId(edgeId))
  if (!nextEdge) {
    if (state.snipersQueue.length > 1) {
      const nextEdgeId = state.snipersQueue[0].edgeIdToTriggerWhenDone
      const isMergingWithParent = state.snipersQueue[0].isMergingWithParent
      const currentResultId = state.snipersQueue[0].resultId
      if (!isMergingWithParent && currentResultId)
        await upsertResult({
          resultId: currentResultId,
          sniper: state.snipersQueue[0].sniper,
          isCompleted: true,
          hasStarted: state.snipersQueue[0].answers.length > 0,
        })
      let newSessionState = {
        ...state,
        snipersQueue: [
          {
            ...state.snipersQueue[1],
            sniper: isMergingWithParent
              ? {
                  ...state.snipersQueue[1].sniper,
                  variables: state.snipersQueue[1].sniper.variables
                    .map((variable) => ({
                      ...variable,
                      value:
                        state.snipersQueue[0].sniper.variables.find(
                          (v) => v.name === variable.name
                        )?.value ?? variable.value,
                    }))
                    .concat(
                      state.snipersQueue[0].sniper.variables.filter(
                        (variable) =>
                          isDefined(variable.value) &&
                          isNotDefined(
                            state.snipersQueue[1].sniper.variables.find(
                              (v) => v.name === variable.name
                            )
                          )
                      ) as VariableWithValue[]
                    ),
                }
              : state.snipersQueue[1].sniper,
            answers: isMergingWithParent
              ? [
                  ...state.snipersQueue[1].answers.filter(
                    (incomingAnswer) =>
                      !state.snipersQueue[0].answers.find(
                        (currentAnswer) =>
                          currentAnswer.key === incomingAnswer.key
                      )
                  ),
                  ...state.snipersQueue[0].answers,
                ]
              : state.snipersQueue[1].answers,
          },
          ...state.snipersQueue.slice(2),
        ],
      } satisfies SessionState
      if (state.progressMetadata)
        newSessionState.progressMetadata = {
          ...state.progressMetadata,
          totalAnswers:
            state.progressMetadata.totalAnswers +
            state.snipersQueue[0].answers.length,
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
  const nextGroup = state.snipersQueue[0].sniper.groups.find(
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
  const resultId = state.snipersQueue[0].resultId
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
