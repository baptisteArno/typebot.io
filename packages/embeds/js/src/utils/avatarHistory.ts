import type { ContinueChatResponse } from "@typebot.io/bot-engine/schemas/api";
import type { Theme } from "@typebot.io/theme/schemas";
import { getAvatarUrls } from "./dynamicTheme";

export type AvatarHistory = {
  role: "host" | "guest";
  chunkIndex: number;
  avatarUrl: string | undefined;
};

export const initializeAvatarHistory = ({
  initialTheme,
  dynamicTheme,
}: {
  initialTheme: Theme;
  dynamicTheme: ContinueChatResponse["dynamicTheme"];
}): AvatarHistory[] => {
  const avatars = getAvatarUrls(initialTheme, dynamicTheme);
  const history: AvatarHistory[] = [];
  if (avatars.host) {
    history.push({
      role: "host",
      chunkIndex: 0,
      avatarUrl: avatars.host,
    });
  }
  if (avatars.guest) {
    history.push({
      role: "guest",
      chunkIndex: 0,
      avatarUrl: avatars.guest,
    });
  }
  return history;
};

export const getAvatarAtIndex = ({
  avatarHistory,
  currentIndex,
  currentRole,
}: {
  avatarHistory: AvatarHistory[];
  currentIndex: number;
  currentRole: "host" | "guest";
}) => {
  const changes = avatarHistory
    .filter(
      (change) =>
        change.role === currentRole && change.chunkIndex <= currentIndex,
    )
    .sort((a, b) => b.chunkIndex - a.chunkIndex);

  if (changes.length > 0) {
    return changes[0].avatarUrl;
  }
};

export const addAvatarsToHistoryIfChanged = ({
  newAvatars,
  avatarHistory,
  currentChunkIndex,
}: {
  newAvatars: {
    host: string | undefined;
    guest: string | undefined;
  };
  avatarHistory: AvatarHistory[];
  currentChunkIndex: number;
}): AvatarHistory[] => {
  const latestHostAvatarInHistory = avatarHistory.findLast(
    (avatar) => avatar.role === "host",
  )?.avatarUrl;
  const latestGuestAvatarInHistory = avatarHistory.findLast(
    (avatar) => avatar.role === "guest",
  )?.avatarUrl;
  const newAvatarHistory = [...avatarHistory];
  if (newAvatars.host !== latestHostAvatarInHistory)
    newAvatarHistory.push({
      role: "host",
      chunkIndex: currentChunkIndex,
      avatarUrl: newAvatars.host,
    });
  if (newAvatars.guest !== latestGuestAvatarInHistory)
    newAvatarHistory.push({
      role: "guest",
      chunkIndex: currentChunkIndex,
      avatarUrl: newAvatars.guest,
    });
  return newAvatarHistory;
};
