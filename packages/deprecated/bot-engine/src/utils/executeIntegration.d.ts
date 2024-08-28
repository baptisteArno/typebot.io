import { IntegrationState } from '@/types';
import { IntegrationBlock } from '@typebot.io/schemas';
export declare const executeIntegration: ({ block, context, }: {
    block: IntegrationBlock;
    context: IntegrationState;
}) => Promise<string | undefined> | string | undefined;
//# sourceMappingURL=executeIntegration.d.ts.map