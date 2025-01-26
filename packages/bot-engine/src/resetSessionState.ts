import type { SessionState } from "@typebot.io/chat-session/schemas";

export const resetSessionState = (state: SessionState): SessionState => ({
  ...state,
  currentSetVariableHistoryIndex: undefined,
  currentVisitedEdgeIndex: undefined,
  previewMetadata: undefined,
  progressMetadata: undefined,
  typebotsQueue: state.typebotsQueue.map((queueItem) => ({
    ...queueItem,
    answers: [],
  })),
});
