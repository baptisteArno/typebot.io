import { AnswerInput, Edge, PublicTypebot, VariableWithValue } from '@typebot.io/schemas';
import { Log } from '@typebot.io/prisma';
export type TypebotViewerProps = {
    typebot: Omit<PublicTypebot, 'updatedAt' | 'createdAt'>;
    isPreview?: boolean;
    apiHost?: string;
    predefinedVariables?: {
        [key: string]: string | undefined;
    };
    resultId?: string;
    startGroupId?: string;
    isLoading?: boolean;
    onNewGroupVisible?: (edge: Edge) => void;
    onNewAnswer?: (answer: AnswerInput & {
        uploadedFiles: boolean;
    }) => Promise<void>;
    onNewLog?: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void;
    onCompleted?: () => void;
    onVariablesUpdated?: (variables: VariableWithValue[]) => void;
};
export declare const TypebotViewer: ({ typebot, apiHost, isPreview, isLoading, resultId, startGroupId, predefinedVariables, onNewLog, onNewGroupVisible, onNewAnswer, onCompleted, onVariablesUpdated, }: TypebotViewerProps) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TypebotViewer.d.ts.map