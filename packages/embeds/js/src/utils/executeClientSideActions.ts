import { executeChatwoot } from "@/features/blocks/integrations/chatwoot/utils/executeChatwoot";
import { executeGoogleAnalyticsBlock } from "@/features/blocks/integrations/googleAnalytics/utils/executeGoogleAnalytics";
import { streamChat } from "@/features/blocks/integrations/openai/streamChat";
import { executePixel } from "@/features/blocks/integrations/pixel/executePixel";
import { executeWebhook } from "@/features/blocks/integrations/webhook/executeWebhook";
import { executeRedirect } from "@/features/blocks/logic/redirect/utils/executeRedirect";
import {
  executeCode,
  executeScript,
} from "@/features/blocks/logic/script/executeScript";
import { executeSetVariable } from "@/features/blocks/logic/setVariable/executeSetVariable";
import { executeWait } from "@/features/blocks/logic/wait/utils/executeWait";
import type { ClientSideActionContext } from "@/types";
import type {
  ChatLog,
  ContinueChatResponse,
} from "@typebot.io/bot-engine/schemas/api";
import { injectStartProps } from "./injectStartProps";

type Props = {
  clientSideAction: NonNullable<ContinueChatResponse["clientSideActions"]>[0];
  context: ClientSideActionContext;
  onMessageStream?: (props: { id: string; message: string }) => void;
};

export const executeClientSideAction = async ({
  clientSideAction,
  context,
  onMessageStream,
}: Props): Promise<
  | { blockedPopupUrl: string }
  | { replyToSend: string | undefined; logs?: ChatLog[] }
  | { logs: ChatLog[] }
  | void
> => {
  if ("chatwoot" in clientSideAction) {
    return executeChatwoot(clientSideAction.chatwoot);
  }
  if ("googleAnalytics" in clientSideAction) {
    return executeGoogleAnalyticsBlock(clientSideAction.googleAnalytics);
  }
  if ("scriptToExecute" in clientSideAction) {
    return executeScript(clientSideAction.scriptToExecute);
  }
  if ("redirect" in clientSideAction) {
    return executeRedirect(clientSideAction.redirect);
  }
  if ("wait" in clientSideAction) {
    await executeWait(clientSideAction.wait);
    return clientSideAction.expectsDedicatedReply
      ? { replyToSend: undefined }
      : undefined;
  }
  if ("setVariable" in clientSideAction) {
    return executeSetVariable(clientSideAction.setVariable.scriptToExecute);
  }
  if (
    "streamOpenAiChatCompletion" in clientSideAction ||
    "stream" in clientSideAction
  ) {
    const { error, message } = await streamChat(context)({
      messages:
        "streamOpenAiChatCompletion" in clientSideAction
          ? clientSideAction.streamOpenAiChatCompletion?.messages
          : undefined,
      onMessageStream,
    });
    if (error)
      return {
        replyToSend: undefined,
        logs: [
          {
            status: "error",
            description: "Message streaming returned an error",
            details: JSON.stringify(error, null, 2),
          },
        ],
      };
    return { replyToSend: message };
  }
  if ("webhookToExecute" in clientSideAction) {
    const response = await executeWebhook(clientSideAction.webhookToExecute);
    return { replyToSend: response };
  }
  if ("startPropsToInject" in clientSideAction) {
    return injectStartProps(clientSideAction.startPropsToInject);
  }
  if ("pixel" in clientSideAction) {
    return executePixel(clientSideAction.pixel);
  }
  if ("codeToExecute" in clientSideAction) {
    return executeCode(clientSideAction.codeToExecute);
  }
};
