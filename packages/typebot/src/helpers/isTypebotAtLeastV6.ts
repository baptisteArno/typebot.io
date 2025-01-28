import type { Typebot, TypebotV6 } from "../schemas/typebot";

export const isTypebotAtLeastV6 = (typebot: Typebot): typebot is TypebotV6 =>
  Number(typebot.version) >= 6;
