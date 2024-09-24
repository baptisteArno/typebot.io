import type { CommandData } from "../types";

export const open = () => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "open",
  };
  window.postMessage(message);
};
