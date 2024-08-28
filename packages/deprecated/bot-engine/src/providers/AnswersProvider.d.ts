import { AnswerInput, ResultValuesInput, Variable, VariableWithUnknowValue, VariableWithValue } from '@typebot.io/schemas';
import { ReactNode } from 'react';
export declare const AnswersProvider: ({ children, resultId, onNewAnswer, onVariablesUpdated, }: {
    resultId?: string;
    onNewAnswer: (answer: AnswerInput & {
        uploadedFiles: boolean;
    }) => Promise<void> | undefined;
    onVariablesUpdated?: (variables: VariableWithValue[]) => void;
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useAnswers: () => {
    resultId?: string;
    resultValues: ResultValuesInput;
    addAnswer: (existingVariables: Variable[]) => (answer: AnswerInput & {
        uploadedFiles: boolean;
    }) => Promise<void> | undefined;
    updateVariables: (variables: VariableWithUnknowValue[]) => void;
};
//# sourceMappingURL=AnswersProvider.d.ts.map