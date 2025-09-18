import type { CommandArgs, CommandData } from "../types";

export const submitInput = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "submitInput",
    id,
  };
  window.postMessage(message);
};
