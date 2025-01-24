import type {
  TypebotInSession,
  TypebotInSessionV6,
} from "../schemas/chatSession";

export const isTypebotInSessionAtLeastV6 = (
  typebot: TypebotInSession,
): typebot is TypebotInSessionV6 => Number(typebot.version) >= 6;
