import { TypebotViewerProps } from '@/components/TypebotViewer';
import { LinkedTypebot } from '@/providers/TypebotProvider';
import { EdgeId, LogicState } from '@/types';
import { LogicBlock } from '@typebot.io/schemas';
export declare const executeLogic: (block: LogicBlock, context: LogicState) => Promise<{
    nextEdgeId?: EdgeId;
    linkedTypebot?: TypebotViewerProps["typebot"] | LinkedTypebot;
    blockedPopupUrl?: string;
}>;
//# sourceMappingURL=executeLogic.d.ts.map