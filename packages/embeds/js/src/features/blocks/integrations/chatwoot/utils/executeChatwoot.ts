import { executeScript } from "@/features/blocks/logic/script/executeScript";
import type { ScriptToExecute } from "@typebot.io/bot-engine/schemas/clientSideAction";
import { chatwootWebWidgetOpenedMessage } from "../constants";

export const executeChatwoot = (chatwoot: {
  scriptToExecute: ScriptToExecute;
}) => {
  executeScript(chatwoot.scriptToExecute);
  return {
    scriptCallbackMessage: chatwootWebWidgetOpenedMessage,
  };
};
