import type { ChatChunk, InputSubmitContent } from "@/types";
import type { ClientSideAction } from "@typebot.io/chat-api/clientSideAction";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { getStorage } from "./storage";

export type ChatChunkV1 = Pick<ContinueChatResponse, "messages" | "input"> & {
  streamingMessageId?: string;
};

export const migrateLegacyChatChunks = (
  chatChunks: (ChatChunk | ChatChunkV1)[],
  {
    storage: storageType,
    typebotId,
  }: {
    storage: "local" | "session" | undefined;
    typebotId: string;
  },
): ChatChunk[] => {
  if (chatChunks.length === 0) return [];
  if ("version" in chatChunks[0]) return chatChunks as ChatChunk[];
  const storage = getStorage(storageType);
  const avatarsHistory = getAndRemoveLegacyAvatarsHistory({
    storage,
    typebotId,
  });

  return (chatChunks as ChatChunkV1[]).map<ChatChunk>((chunk, index) => ({
    version: "2",
    messages: chunk.messages,
    clientSideActions:
      index === chatChunks.length - 1
        ? injectLegacyClientSideActions({
            storage,
            typebotId,
          })
        : [],
    input: injectLegacyInput({
      input: chunk.input,
      storage,
      typebotId,
      chunkIndex: index,
    }),
    streamingMessage: chunk.streamingMessageId
      ? injectLegacyStreamingMessage({
          streamingMessageId: chunk.streamingMessageId,
          storage,
        })
      : undefined,
    dynamicTheme: injectLegacyDynamicTheme({
      chunkIndex: index,
      avatarsHistory,
    }),
  }));
};

const injectLegacyStreamingMessage = ({
  streamingMessageId,
  storage,
}: {
  streamingMessageId: string;
  storage: Storage;
}): ChatChunk["streamingMessage"] => {
  const key = `typebot-streaming-message-${streamingMessageId}`;
  const streamingMessage = storage.getItem(key) ?? undefined;
  const parsedStreamingMessage = streamingMessage
    ? (JSON.parse(streamingMessage) as ChatChunk["streamingMessage"])
    : undefined;
  storage.removeItem(key);
  return parsedStreamingMessage;
};

const injectLegacyInput = ({
  input,
  storage,
  typebotId,
  chunkIndex,
}: {
  input: ChatChunkV1["input"];
  storage: Storage;
  typebotId: string;
  chunkIndex: number;
}): ChatChunk["input"] => {
  if (!input) return input;
  const answerKey = `typebot-${typebotId}-input-${chunkIndex}`;
  const answerFromStorage = storage.getItem(answerKey) ?? undefined;
  const parsedAnswer: InputSubmitContent | undefined = answerFromStorage
    ? JSON.parse(answerFromStorage)
    : undefined;
  storage.removeItem(answerKey);
  return {
    ...input,
    answer: parsedAnswer,
  };
};

const injectLegacyClientSideActions = ({
  storage,
  typebotId,
}: {
  storage: Storage;
  typebotId: string;
}): ChatChunk["clientSideActions"] => {
  const key = `typebot-${typebotId}-clientSideActions`;
  const legacyClientSideActions = storage.getItem(key);
  storage.removeItem(key);
  if (legacyClientSideActions) {
    const clientSideActions = JSON.parse(
      legacyClientSideActions,
    ) as ClientSideAction[];
    return clientSideActions;
  }
};

const injectLegacyDynamicTheme = ({
  chunkIndex,
  avatarsHistory,
}: {
  chunkIndex: number;
  avatarsHistory: {
    role: "host" | "guest";
    chunkIndex: number;
    avatarUrl: string | undefined;
  }[];
}): ChatChunk["dynamicTheme"] => {
  const avatars = avatarsHistory.filter(
    (item) => item.chunkIndex === chunkIndex,
  );
  if (avatars.length > 0)
    return {
      hostAvatarUrl: avatars.find((item) => item.role === "host")?.avatarUrl,
      guestAvatarUrl: avatars.find((item) => item.role === "guest")?.avatarUrl,
    };
  return undefined;
};

const getAndRemoveLegacyAvatarsHistory = ({
  storage,
  typebotId,
}: {
  storage: Storage;
  typebotId: string;
}) => {
  const key = `typebot-${typebotId}-avatarsHistory`;
  const legacyAvatarsHistory = storage.getItem(key);
  storage.removeItem(key);
  return legacyAvatarsHistory
    ? (JSON.parse(legacyAvatarsHistory) as {
        role: "host" | "guest";
        chunkIndex: number;
        avatarUrl: string | undefined;
      }[])
    : [];
};
