import type { CommandArgs, CommandData } from "../types";

export const setInputValue = (value: string, { id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "setInputValue",
    value,
    id,
  };
  window.postMessage(message);
};
