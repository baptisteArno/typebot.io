import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ContinueChatResponse } from "./schemas/api";
import type { SessionState } from "./schemas/chatSession";

export const parseDynamicTheme = (
  state: SessionState | undefined,
): ContinueChatResponse["dynamicTheme"] => {
  if (!state?.dynamicTheme) return;
  return {
    hostAvatarUrl: parseVariables(state?.typebotsQueue[0].typebot.variables)(
      state.dynamicTheme.hostAvatarUrl,
    ),
    guestAvatarUrl: parseVariables(state?.typebotsQueue[0].typebot.variables)(
      state.dynamicTheme.guestAvatarUrl,
    ),
  };
};
