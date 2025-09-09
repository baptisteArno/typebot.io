import type { ScriptToExecute } from "@typebot.io/chat-api/clientSideAction";
import { executeScript } from "@/features/blocks/logic/script/executeScript";
import { chatwootWebWidgetOpenedMessage } from "../constants";

export const executeChatwoot = (chatwoot: {
  scriptToExecute: ScriptToExecute;
}) => {
  executeScript(chatwoot.scriptToExecute);
  return {
    scriptCallbackMessage: chatwootWebWidgetOpenedMessage,
  };
};
