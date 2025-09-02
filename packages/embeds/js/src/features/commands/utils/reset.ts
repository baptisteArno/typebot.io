import type { CommandArgs, CommandData } from "../types";

export const reset = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "reset",
    id,
  };
  window.postMessage(message);
};
