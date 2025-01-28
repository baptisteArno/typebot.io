import type { CommandArgs, CommandData } from "../types";

export const toggle = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "toggle",
    id,
  };
  window.postMessage(message);
};
