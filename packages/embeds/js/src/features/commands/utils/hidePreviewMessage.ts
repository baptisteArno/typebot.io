import type { CommandData } from "../types";

export const hidePreviewMessage = () => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "hidePreviewMessage",
  };
  window.postMessage(message);
};
