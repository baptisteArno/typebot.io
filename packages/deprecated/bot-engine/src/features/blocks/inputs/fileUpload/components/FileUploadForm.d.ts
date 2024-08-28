import { InputSubmitContent } from '@/types';
import { FileInputBlock } from '@typebot.io/schemas';
type Props = {
    block: FileInputBlock;
    onSubmit: (url: InputSubmitContent) => void;
    onSkip: () => void;
};
export declare const FileUploadForm: ({ block: { id, options }, onSubmit, onSkip, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FileUploadForm.d.ts.map