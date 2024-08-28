import { Block } from '@typebot.io/schemas';
import type { TypebotPostMessageData } from 'typebot-js/src/types';
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants';
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants';
export declare const getLastChatBlockType: (blocks: Block[]) => BubbleBlockType | InputBlockType | undefined;
export declare const sendEventToParent: (data: TypebotPostMessageData) => void;
//# sourceMappingURL=chat.d.ts.map