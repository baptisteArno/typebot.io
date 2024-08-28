import { InputSubmitContent } from '@/types';
import { TextInputBlock } from '@typebot.io/schemas';
type TextInputProps = {
    block: TextInputBlock;
    onSubmit: (value: InputSubmitContent) => void;
    defaultValue: string | undefined;
    hasGuestAvatar: boolean;
};
export declare const TextInput: ({ block, onSubmit, defaultValue, hasGuestAvatar, }: TextInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TextInput.d.ts.map