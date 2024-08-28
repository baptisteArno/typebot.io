import { InputSubmitContent } from '@/types';
import { DateInputBlock } from '@typebot.io/schemas';
type DateInputProps = {
    onSubmit: (inputValue: InputSubmitContent) => void;
    options: DateInputBlock['options'];
};
export declare const DateForm: ({ onSubmit, options, }: DateInputProps) => JSX.Element;
export {};
//# sourceMappingURL=DateForm.d.ts.map