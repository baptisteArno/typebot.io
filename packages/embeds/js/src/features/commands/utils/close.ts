import type { CommandData } from "../types";

export const close = () => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "close",
  };
  window.postMessage(message);
};
