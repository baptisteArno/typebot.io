import type { CommandArgs, CommandData } from "../types";

export const reload = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "reload",
    id,
  };
  window.postMessage(message);
};
