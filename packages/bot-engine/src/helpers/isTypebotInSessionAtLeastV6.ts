import type {
  TypebotInSession,
  TypebotInSessionV6,
} from "@typebot.io/chat-session/schemas";

export const isTypebotInSessionAtLeastV6 = (
  typebot: TypebotInSession,
): typebot is TypebotInSessionV6 => Number(typebot.version) >= 6;
