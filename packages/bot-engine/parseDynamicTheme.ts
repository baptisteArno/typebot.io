import { SessionState, ContinueChatResponse } from '@sniper.io/schemas'
import { parseVariables } from '@sniper.io/variables/parseVariables'

export const parseDynamicTheme = (
  state: SessionState | undefined
): ContinueChatResponse['dynamicTheme'] => {
  if (!state?.dynamicTheme) return
  return {
    hostAvatarUrl: parseVariables(state?.snipersQueue[0].sniper.variables)(
      state.dynamicTheme.hostAvatarUrl
    ),
    guestAvatarUrl: parseVariables(state?.snipersQueue[0].sniper.variables)(
      state.dynamicTheme.guestAvatarUrl
    ),
  }
}
