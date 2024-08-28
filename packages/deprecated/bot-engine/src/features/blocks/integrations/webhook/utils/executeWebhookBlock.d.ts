import { IntegrationState } from '@/types';
import { HttpRequestBlock, ZapierBlock, MakeComBlock, PabblyConnectBlock } from '@typebot.io/schemas';
export declare const executeWebhook: (block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock, { blockId, variables, updateVariableValue, updateVariables, typebotId, apiHost, resultValues, onNewLog, resultId, parentTypebotIds, }: IntegrationState) => Promise<string | undefined>;
//# sourceMappingURL=executeWebhookBlock.d.ts.map