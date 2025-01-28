import type { CommandArgs, CommandData } from "../types";

export const setPrefilledVariables = (
  variables: Record<string, string | number | boolean>,
  { id }: CommandArgs = {},
) => {
  const message: CommandData = {
    isFromTypebot: true,
    command: "setPrefilledVariables",
    variables,
    id,
  };
  window.postMessage(message);
};
