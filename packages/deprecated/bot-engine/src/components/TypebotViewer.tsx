import { env } from "@typebot.io/env";
import type { Prisma } from "@typebot.io/prisma/types";
import type { AnswerInput } from "@typebot.io/results/schemas/answers";
import type { Log } from "@typebot.io/results/schemas/results";
import { BackgroundType } from "@typebot.io/theme/constants";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import { useMemo } from "react";
import importantStyles from "../assets/importantStyles.css";
import phoneSyle from "../assets/phone.css";
import styles from "../assets/style.css";
import { AnswersProvider } from "../providers/AnswersProvider";
import { TypebotProvider } from "../providers/TypebotProvider";
import { ConversationContainer } from "./ConversationContainer";
import { LiteBadge } from "./LiteBadge";

export type TypebotViewerProps = {
  typebot: Omit<PublicTypebot, "updatedAt" | "createdAt">;
  isPreview?: boolean;
  apiHost?: string;
  predefinedVariables?: { [key: string]: string | undefined };
  resultId?: string;
  startGroupId?: string;
  isLoading?: boolean;
  onNewGroupVisible?: (edge: Edge) => void;
  onNewAnswer?: (
    answer: AnswerInput & { uploadedFiles: boolean },
  ) => Promise<void>;
  onNewLog?: (log: Omit<Log, "id" | "createdAt" | "resultId">) => void;
  onCompleted?: () => void;
  onVariablesUpdated?: (variables: VariableWithValue[]) => void;
};

export const TypebotViewer = ({
  typebot,
  apiHost = env.NEXT_PUBLIC_VIEWER_URL[0],
  isPreview = false,
  isLoading = false,
  resultId,
  startGroupId,
  predefinedVariables,
  onNewLog,
  onNewGroupVisible,
  onNewAnswer,
  onCompleted,
  onVariablesUpdated,
}: TypebotViewerProps) => {
  const containerBgColor = useMemo(
    () =>
      typebot?.theme?.general?.background?.type === BackgroundType.COLOR
        ? typebot.theme.general.background.content
        : "transparent",
    [typebot?.theme?.general?.background],
  );
  const handleNewGroupVisible = (edge: Edge) =>
    onNewGroupVisible && onNewGroupVisible(edge);

  const handleNewAnswer = (answer: AnswerInput & { uploadedFiles: boolean }) =>
    onNewAnswer && onNewAnswer(answer);

  const handleNewLog = (log: Omit<Log, "id" | "createdAt" | "resultId">) =>
    onNewLog && onNewLog(log);

  const handleCompleted = () => onCompleted && onCompleted();

  return (
    <>
      <style>
        {phoneSyle}
        {styles}
      </style>
      <style>{typebot.theme?.customCss}</style>
      <style>{importantStyles}</style>
      {typebot?.theme?.general?.font && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@import url('https://fonts.googleapis.com/css2?family=${
              typebot.theme.general?.font ?? "Open Sans"
            }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');`,
          }}
        />
      )}
      <TypebotProvider
        typebot={typebot}
        apiHost={apiHost}
        isPreview={isPreview}
        onNewLog={handleNewLog}
        isLoading={isLoading}
      >
        <AnswersProvider
          resultId={resultId}
          onNewAnswer={handleNewAnswer}
          onVariablesUpdated={onVariablesUpdated}
        >
          <div
            className="flex text-base overflow-hidden bg-cover h-screen w-screen flex-col items-center typebot-container"
            style={{
              // We set this as inline style to avoid color flash for SSR
              backgroundColor: containerBgColor ?? "transparent",
            }}
            data-testid="container"
          >
            <div className="flex w-full h-full justify-center">
              <ConversationContainer
                theme={typebot.theme}
                onNewGroupVisible={handleNewGroupVisible}
                onCompleted={handleCompleted}
                predefinedVariables={predefinedVariables}
                startGroupId={startGroupId}
              />
            </div>
            {typebot.settings.general?.isBrandingEnabled && <LiteBadge />}
          </div>
        </AnswersProvider>
      </TypebotProvider>
    </>
  );
};
