import { InputSubmitContent } from '@/types';
import { UrlInputBlock } from '@typebot.io/schemas';
type UrlInputProps = {
    block: UrlInputBlock;
    onSubmit: (value: InputSubmitContent) => void;
    defaultValue?: string;
    hasGuestAvatar: boolean;
};
export declare const UrlInput: ({ block, onSubmit, defaultValue, hasGuestAvatar, }: UrlInputProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UrlInput.d.ts.map