import { EdgeId, LogicState } from '@/types';
import { RedirectBlock } from '@typebot.io/schemas';
export declare const executeRedirect: (block: RedirectBlock, { typebot: { variables } }: LogicState) => {
    nextEdgeId?: EdgeId;
    blockedPopupUrl?: string;
};
//# sourceMappingURL=executeRedirect.d.ts.map