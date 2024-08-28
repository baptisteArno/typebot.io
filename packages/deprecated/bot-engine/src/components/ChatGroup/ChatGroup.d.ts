import { LinkedTypebot } from '../../providers/TypebotProvider';
import { PublicTypebot, Block } from '@typebot.io/schemas';
type ChatGroupProps = {
    blocks: Block[];
    startBlockIndex: number;
    groupTitle: string;
    keepShowingHostAvatar: boolean;
    onGroupEnd: ({ edgeId, updatedTypebot, }: {
        edgeId?: string;
        updatedTypebot?: PublicTypebot | LinkedTypebot;
    }) => void;
};
export declare const ChatGroup: ({ blocks, startBlockIndex, groupTitle, onGroupEnd, keepShowingHostAvatar, }: ChatGroupProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ChatGroup.d.ts.map