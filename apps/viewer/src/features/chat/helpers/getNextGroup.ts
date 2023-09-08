import { byId } from '@typebot.io/lib'
import { Group, SessionState } from '@typebot.io/schemas'
import { upsertResult } from '../queries/upsertResult'

export type NextGroup = {
  group?: Group
  newSessionState: SessionState
}

export const getNextGroup =
  (state: SessionState) =>
  async (edgeId?: string): Promise<NextGroup> => {
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
        const newSessionState = {
          ...state,
          typebotsQueue: [
            {
              ...state.typebotsQueue[1],
              typebot: isMergingWithParent
                ? {
                    ...state.typebotsQueue[1].typebot,
                    variables: state.typebotsQueue[1].typebot.variables.map(
                      (variable) => ({
                        ...variable,
                        value:
                          state.typebotsQueue[0].answers.find(
                            (answer) => answer.key === variable.name
                          )?.value ?? variable.value,
                      })
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
        const nextGroup = await getNextGroup(newSessionState)(nextEdgeId)
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
    return {
      group: {
        ...nextGroup,
        blocks: nextGroup.blocks.slice(startBlockIndex),
      },
      newSessionState: state,
    }
  }
