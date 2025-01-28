import type { CommandArgs, CommandData } from "../types";

export const hidePreviewMessage = ({ id }: CommandArgs = {}) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "hidePreviewMessage",
    id,
  };
  window.postMessage(message);
};
