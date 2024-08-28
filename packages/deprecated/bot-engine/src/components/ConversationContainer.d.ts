import { Edge, Theme } from '@typebot.io/schemas';
type Props = {
    theme: Theme;
    predefinedVariables?: {
        [key: string]: string | undefined;
    };
    startGroupId?: string;
    onNewGroupVisible: (edge: Edge) => void;
    onCompleted: () => void;
};
export declare const ConversationContainer: ({ theme, predefinedVariables, startGroupId, onNewGroupVisible, onCompleted, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConversationContainer.d.ts.map