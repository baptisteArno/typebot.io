import type { InputMessage, Message } from "@typebot.io/chat-api/schemas";

export const isInputMessage = (
  message: Message | undefined,
): message is InputMessage => message?.type !== "command";
