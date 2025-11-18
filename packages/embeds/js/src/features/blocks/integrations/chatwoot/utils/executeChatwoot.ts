import type { ScriptToExecute } from "@typebot.io/chat-api/clientSideAction";
import { executeScript } from "@/features/blocks/logic/script/executeScript";
import type { ClientSideActionContext } from "@/types";
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
