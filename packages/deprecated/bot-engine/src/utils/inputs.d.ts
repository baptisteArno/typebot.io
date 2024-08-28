import { BubbleBlock, Edge, EmailInputBlock, PhoneNumberInputBlock, Block, UrlInputBlock, Variable } from '@typebot.io/schemas';
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants';
export declare const isInputValid: (inputValue: string, type: InputBlockType) => boolean;
export declare const blockCanBeRetried: (block: Block) => block is EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock;
export declare const parseRetryBlock: (block: EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock, groupId: string, variables: Variable[], createEdge: (edge: Edge) => void) => BubbleBlock;
//# sourceMappingURL=inputs.d.ts.map