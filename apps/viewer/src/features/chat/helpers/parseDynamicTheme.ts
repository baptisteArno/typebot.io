import { parseVariables } from '@/features/variables/parseVariables'
import { SessionState, ChatReply } from '@typebot.io/schemas'

export const parseDynamicTheme = (
  state: SessionState | undefined
): ChatReply['dynamicTheme'] => {
  if (!state?.dynamicTheme) return
  return {
    hostAvatarUrl: parseVariables(state?.typebotsQueue[0].typebot.variables)(
      state.dynamicTheme.hostAvatarUrl
    ),
    guestAvatarUrl: parseVariables(state?.typebotsQueue[0].typebot.variables)(
      state.dynamicTheme.guestAvatarUrl
    ),
  }
}
