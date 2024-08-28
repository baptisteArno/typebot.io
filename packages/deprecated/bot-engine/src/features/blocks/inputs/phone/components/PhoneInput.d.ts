import { InputSubmitContent } from '@/types';
import { PhoneNumberInputBlock } from '@typebot.io/schemas';
type PhoneInputProps = {
    block: PhoneNumberInputBlock;
    onSubmit: (value: InputSubmitContent) => void;
    defaultValue?: string;
    hasGuestAvatar: boolean;
};
export declare const PhoneInput: ({ block, onSubmit, defaultValue, hasGuestAvatar, }: PhoneInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PhoneInput.d.ts.map