import type {
  CommandArgs,
  CommandData,
  ShowMessageCommandData,
} from "../types";

export const showPreviewMessage = (
  proactiveMessage: ShowMessageCommandData["message"] | undefined,
  { id }: CommandArgs = {},
) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "showPreviewMessage",
    message: proactiveMessage,
    id,
  };
  window.postMessage(message);
};
