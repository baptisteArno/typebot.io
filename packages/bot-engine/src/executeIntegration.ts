import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import type { IntegrationBlock } from "@typebot.io/blocks-integrations/schema";
import { env } from "@typebot.io/env";
import { isNotDefined } from "@typebot.io/lib/utils";
import { executeChatwootBlock } from "./blocks/integrations/chatwoot/executeChatwootBlock";
import { executeGoogleSheetBlock } from "./blocks/integrations/googleSheets/executeGoogleSheetBlock";
import { executeGoogleAnalyticsBlock } from "./blocks/integrations/legacy/googleAnalytics/executeGoogleAnalyticsBlock";
import { executeOpenAIBlock } from "./blocks/integrations/legacy/openai/executeOpenAIBlock";
import { executePixelBlock } from "./blocks/integrations/pixel/executePixelBlock";
import { executeSendEmailBlock } from "./blocks/integrations/sendEmail/executeSendEmailBlock";
import { executeWebhookBlock } from "./blocks/integrations/webhook/executeWebhookBlock";
import { executeForgedBlock } from "./forge/executeForgedBlock";
import type { SessionState } from "./schemas/chatSession";
import type { ExecuteIntegrationResponse } from "./types";

export const executeIntegration =
  (state: SessionState) =>
  async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
    switch (block.type) {
      case IntegrationBlockType.GOOGLE_SHEETS:
        return {
          ...(await executeGoogleSheetBlock(state, block)),
          startTimeShouldBeUpdated: true,
        };
      case IntegrationBlockType.CHATWOOT:
        return executeChatwootBlock(state, block);
      case IntegrationBlockType.GOOGLE_ANALYTICS:
        return executeGoogleAnalyticsBlock(state, block);
      case IntegrationBlockType.EMAIL:
        return executeSendEmailBlock(state, block);
      case IntegrationBlockType.ZAPIER:
      case IntegrationBlockType.MAKE_COM:
      case IntegrationBlockType.PABBLY_CONNECT:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: true,
          })),
          startTimeShouldBeUpdated: true,
        };
      case IntegrationBlockType.WEBHOOK:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: isNotDefined(env.CHAT_API_TIMEOUT),
          })),
        };
      case IntegrationBlockType.OPEN_AI:
        return {
          ...(await executeOpenAIBlock(state, block)),
          startTimeShouldBeUpdated: true,
        };
      case IntegrationBlockType.PIXEL:
        return executePixelBlock(state, block);
      default:
        return {
          ...(await executeForgedBlock(state, block)),
          startTimeShouldBeUpdated: true,
        };
    }
  };
