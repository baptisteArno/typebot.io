import type { CommandArgs, CommandData } from "../types";

export const unmount = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "unmount",
    id,
  };
  window.postMessage(message);
};
