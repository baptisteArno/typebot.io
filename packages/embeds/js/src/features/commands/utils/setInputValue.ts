import type { CommandData } from "../types";

export const setInputValue = (value: string) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "setInputValue",
    value,
  };
  window.postMessage(message);
};
