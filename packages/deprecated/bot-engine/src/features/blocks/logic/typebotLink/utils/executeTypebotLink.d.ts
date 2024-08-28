import { LinkedTypebot } from '@/providers/TypebotProvider';
import { EdgeId, LogicState } from '@/types';
import { TypebotLinkBlock, PublicTypebot } from '@typebot.io/schemas';
export declare const executeTypebotLink: (block: TypebotLinkBlock, context: LogicState) => Promise<{
    nextEdgeId?: EdgeId;
    linkedTypebot?: PublicTypebot | LinkedTypebot;
}>;
//# sourceMappingURL=executeTypebotLink.d.ts.map