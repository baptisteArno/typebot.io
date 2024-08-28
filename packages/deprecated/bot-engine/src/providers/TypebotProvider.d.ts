import { TypebotViewerProps } from '@/components/TypebotViewer';
import { Log } from '@typebot.io/prisma';
import { Edge, PublicTypebot, Typebot } from '@typebot.io/schemas';
import { ReactNode } from 'react';
export type LinkedTypebot = Pick<PublicTypebot | Typebot, 'id' | 'groups' | 'variables' | 'edges'>;
export type LinkedTypebotQueue = {
    typebotId: string;
    edgeId: string;
}[];
export declare const TypebotProvider: ({ children, typebot, apiHost, isPreview, isLoading, onNewLog, }: {
    children: ReactNode;
    typebot: TypebotViewerProps["typebot"];
    apiHost: string;
    isLoading: boolean;
    isPreview: boolean;
    onNewLog: (log: Omit<Log, "id" | "createdAt" | "resultId">) => void;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useTypebot: () => {
    currentTypebotId: string;
    typebot: TypebotViewerProps["typebot"];
    linkedTypebots: LinkedTypebot[];
    apiHost: string;
    isPreview: boolean;
    linkedBotQueue: LinkedTypebotQueue;
    isLoading: boolean;
    parentTypebotIds: string[];
    setCurrentTypebotId: (id: string) => void;
    updateVariableValue: (variableId: string, value: unknown) => void;
    createEdge: (edge: Edge) => void;
    injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot;
    pushParentTypebotId: (typebotId: string) => void;
    popEdgeIdFromLinkedTypebotQueue: () => void;
    pushEdgeIdInLinkedTypebotQueue: (bot: {
        typebotId: string;
        edgeId: string;
    }) => void;
    onNewLog: (log: Omit<Log, "id" | "createdAt" | "resultId">) => void;
};
//# sourceMappingURL=TypebotProvider.d.ts.map