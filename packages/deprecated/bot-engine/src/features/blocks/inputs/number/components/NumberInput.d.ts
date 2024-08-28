import { InputSubmitContent } from '@/types';
import { NumberInputBlock } from '@typebot.io/schemas';
type NumberInputProps = {
    block: NumberInputBlock;
    onSubmit: (value: InputSubmitContent) => void;
    defaultValue?: string;
    hasGuestAvatar: boolean;
};
export declare const NumberInput: ({ block, onSubmit, defaultValue, hasGuestAvatar, }: NumberInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=NumberInput.d.ts.map