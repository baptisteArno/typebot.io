import type { CommandArgs, CommandData } from "../types";

export const open = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "open",
    id,
  };
  window.postMessage(message);
};
