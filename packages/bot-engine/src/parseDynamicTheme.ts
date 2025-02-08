import type { SessionState } from "@typebot.io/chat-session/schemas";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ContinueChatResponse } from "./schemas/api";

export const parseDynamicTheme = (
  state: SessionState | undefined,
): ContinueChatResponse["dynamicTheme"] => {
  if (!state?.dynamicTheme) return;
  return {
    hostAvatarUrl: state.dynamicTheme.hostAvatarUrl
      ? parseVariables(state?.typebotsQueue[0].typebot.variables)(
          state.dynamicTheme.hostAvatarUrl,
        )
      : undefined,
    guestAvatarUrl: state.dynamicTheme.guestAvatarUrl
      ? parseVariables(state?.typebotsQueue[0].typebot.variables)(
          state.dynamicTheme.guestAvatarUrl,
        )
      : undefined,
    backgroundUrl: state.dynamicTheme.backgroundUrl
      ? parseVariables(state?.typebotsQueue[0].typebot.variables)(
          state.dynamicTheme.backgroundUrl,
        )
      : undefined,
  };
};
