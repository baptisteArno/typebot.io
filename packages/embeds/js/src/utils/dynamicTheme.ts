import type { ContinueChatResponse } from "@typebot.io/bot-engine/schemas/api";
import type { Theme } from "@typebot.io/theme/schemas";

export const mergeThemes = (
  initialTheme: Theme,
  dynamicTheme: ContinueChatResponse["dynamicTheme"],
): Theme => ({
  ...initialTheme,
  general: initialTheme.general
    ? {
        ...initialTheme.general,
        background: initialTheme.general.background
          ? {
              ...initialTheme.general.background,
              content:
                dynamicTheme?.backgroundUrl ??
                initialTheme.general.background?.content,
            }
          : undefined,
      }
    : undefined,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat?.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
            ...initialTheme.chat.hostAvatar,
            url: dynamicTheme.hostAvatarUrl,
          }
        : initialTheme.chat?.hostAvatar,
    guestAvatar:
      initialTheme.chat?.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
            ...initialTheme.chat.guestAvatar,
            url: dynamicTheme?.guestAvatarUrl,
          }
        : initialTheme.chat?.guestAvatar,
  },
});
