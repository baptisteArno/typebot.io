import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import type { IntegrationBlock } from "@typebot.io/blocks-integrations/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeChatwootBlock } from "./blocks/integrations/chatwoot/executeChatwootBlock";
import { executeGoogleSheetBlock } from "./blocks/integrations/googleSheets/executeGoogleSheetBlock";
import { executeHttpRequestBlock } from "./blocks/integrations/httpRequest/executeHttpRequestBlock";
import { executeGoogleAnalyticsBlock } from "./blocks/integrations/legacy/googleAnalytics/executeGoogleAnalyticsBlock";
import { executeOpenAIBlock } from "./blocks/integrations/legacy/openai/executeOpenAIBlock";
import { executePixelBlock } from "./blocks/integrations/pixel/executePixelBlock";
import { executeSendEmailBlock } from "./blocks/integrations/sendEmail/executeSendEmailBlock";
import { executeForgedBlock } from "./forge/executeForgedBlock";
import type { ExecuteIntegrationResponse } from "./types";

export const executeIntegration = async ({
  state,
  sessionStore,
  block,
}: {
  state: SessionState;
  sessionStore: SessionStore;
  block: IntegrationBlock;
}): Promise<ExecuteIntegrationResponse> => {
  switch (block.type) {
    case IntegrationBlockType.GOOGLE_SHEETS:
      return {
        ...(await executeGoogleSheetBlock(block, { state, sessionStore })),
        startTimeShouldBeUpdated: true,
      };
    case IntegrationBlockType.CHATWOOT:
      return executeChatwootBlock(block, { state, sessionStore });
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return executeGoogleAnalyticsBlock(block, { state, sessionStore });
    case IntegrationBlockType.EMAIL:
      return executeSendEmailBlock({ state, block, sessionStore });
    case IntegrationBlockType.ZAPIER:
    case IntegrationBlockType.MAKE_COM:
    case IntegrationBlockType.PABBLY_CONNECT:
      return {
        ...(await executeHttpRequestBlock(block, {
          state,
          sessionStore,
          disableRequestTimeout: true,
        })),
        startTimeShouldBeUpdated: true,
      };
    case IntegrationBlockType.HTTP_REQUEST:
      return {
        ...(await executeHttpRequestBlock(block, {
          state,
          sessionStore,
          disableRequestTimeout: isNotDefined(env.CHAT_API_TIMEOUT),
        })),
      };
    case IntegrationBlockType.OPEN_AI:
      return {
        ...(await executeOpenAIBlock(state, block, sessionStore)),
        startTimeShouldBeUpdated: true,
      };
    case IntegrationBlockType.PIXEL:
      return executePixelBlock(block, { state, sessionStore });
    default:
      return {
        ...(await executeForgedBlock(block, { state, sessionStore })),
        startTimeShouldBeUpdated: true,
      };
  }
};
