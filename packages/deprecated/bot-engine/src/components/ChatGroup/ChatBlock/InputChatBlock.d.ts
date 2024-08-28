import { InputBlock } from '@typebot.io/schemas';
import { InputSubmitContent } from '@/types';
export declare const InputChatBlock: ({ block, hasAvatar, hasGuestAvatar, onTransitionEnd, onSkip, }: {
    block: InputBlock;
    hasGuestAvatar: boolean;
    hasAvatar: boolean;
    onTransitionEnd: (answerContent?: InputSubmitContent, isRetry?: boolean) => void;
    onSkip: () => void;
}) => import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=InputChatBlock.d.ts.map