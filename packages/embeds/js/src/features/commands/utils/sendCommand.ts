import type { CommandArgs, CommandData } from "../types";

export const sendCommand = (text: string, { id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "sendCommand",
    text,
    id,
  };
  window.postMessage(message);
};
