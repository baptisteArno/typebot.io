import type { InputMessage, Message } from "../schemas/api";

export const isInputMessage = (
  message: Message | undefined,
): message is InputMessage => message?.type !== "command";
