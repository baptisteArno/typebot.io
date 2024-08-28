import { InputSubmitContent } from '@/types';
import { EmailInputBlock } from '@typebot.io/schemas';
type EmailInputProps = {
    block: EmailInputBlock;
    onSubmit: (value: InputSubmitContent) => void;
    defaultValue?: string;
    hasGuestAvatar: boolean;
};
export declare const EmailInput: ({ block, onSubmit, defaultValue, hasGuestAvatar, }: EmailInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=EmailInput.d.ts.map