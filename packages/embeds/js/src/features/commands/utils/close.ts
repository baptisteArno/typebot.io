import type { CommandArgs, CommandData } from "../types";

export const close = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "close",
    id,
  };
  window.postMessage(message);
};
