import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'

export const resetSessionState = (state: SessionState): SessionState => ({
  ...state,
  currentSetVariableHistoryIndex: undefined,
  currentVisitedEdgeIndex: undefined,
  previewMetadata: undefined,
  progressMetadata: undefined,
  typebotsQueue: state.typebotsQueue.map((queueItem) => ({
    ...queueItem,
    answers: [],
    typebot: {
      ...queueItem.typebot,
      variables: queueItem.typebot.variables.map((variable) => ({
        ...variable,
        value: undefined,
      })),
    },
  })),
})
