import type { ScriptToExecute } from "@typebot.io/chat-api/clientSideAction";
import type { ClientSideActionContext } from "../../../../../types";
import { executeScript } from "../../../logic/script/executeScript";
import { chatwootWebWidgetOpenedMessage } from "../constants";

export const executeChatwoot = (
  chatwoot: {
    scriptToExecute: ScriptToExecute;
  },
  { isPreview }: Pick<ClientSideActionContext, "isPreview">,
) => {
  executeScript(chatwoot.scriptToExecute, { isPreview });
  return {
    scriptCallbackMessage: chatwootWebWidgetOpenedMessage,
  };
};
