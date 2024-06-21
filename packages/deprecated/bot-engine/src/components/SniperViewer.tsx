import { useMemo } from 'react'
import { SniperProvider } from '../providers/SniperProvider'
import styles from '../assets/style.css'
import importantStyles from '../assets/importantStyles.css'
import phoneSyle from '../assets/phone.css'
import { ConversationContainer } from './ConversationContainer'
import { AnswersProvider } from '../providers/AnswersProvider'
import {
  AnswerInput,
  Edge,
  PublicSniper,
  VariableWithValue,
} from '@sniper.io/schemas'
import { Log } from '@sniper.io/prisma'
import { LiteBadge } from './LiteBadge'
import { BackgroundType } from '@sniper.io/schemas/features/sniper/theme/constants'
import { env } from '@sniper.io/env'

export type SniperViewerProps = {
  sniper: Omit<PublicSniper, 'updatedAt' | 'createdAt'>
  isPreview?: boolean
  apiHost?: string
  predefinedVariables?: { [key: string]: string | undefined }
  resultId?: string
  startGroupId?: string
  isLoading?: boolean
  onNewGroupVisible?: (edge: Edge) => void
  onNewAnswer?: (
    answer: AnswerInput & { uploadedFiles: boolean }
  ) => Promise<void>
  onNewLog?: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  onCompleted?: () => void
  onVariablesUpdated?: (variables: VariableWithValue[]) => void
}

export const SniperViewer = ({
  sniper,
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
}: SniperViewerProps) => {
  const containerBgColor = useMemo(
    () =>
      sniper?.theme?.general?.background?.type === BackgroundType.COLOR
        ? sniper.theme.general.background.content
        : 'transparent',
    [sniper?.theme?.general?.background]
  )
  const handleNewGroupVisible = (edge: Edge) =>
    onNewGroupVisible && onNewGroupVisible(edge)

  const handleNewAnswer = (answer: AnswerInput & { uploadedFiles: boolean }) =>
    onNewAnswer && onNewAnswer(answer)

  const handleNewLog = (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) =>
    onNewLog && onNewLog(log)

  const handleCompleted = () => onCompleted && onCompleted()

  return (
    <>
      <style>
        {phoneSyle}
        {styles}
      </style>
      <style>{sniper.theme?.customCss}</style>
      <style>{importantStyles}</style>
      {sniper?.theme?.general?.font && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@import url('https://fonts.googleapis.com/css2?family=${
              sniper.theme.general?.font ?? 'Open Sans'
            }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');`,
          }}
        />
      )}
      <SniperProvider
        sniper={sniper}
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
            className="flex text-base overflow-hidden bg-cover h-screen w-screen flex-col items-center sniper-container"
            style={{
              // We set this as inline style to avoid color flash for SSR
              backgroundColor: containerBgColor ?? 'transparent',
            }}
            data-testid="container"
          >
            <div className="flex w-full h-full justify-center">
              <ConversationContainer
                theme={sniper.theme}
                onNewGroupVisible={handleNewGroupVisible}
                onCompleted={handleCompleted}
                predefinedVariables={predefinedVariables}
                startGroupId={startGroupId}
              />
            </div>
            {sniper.settings.general?.isBrandingEnabled && <LiteBadge />}
          </div>
        </AnswersProvider>
      </SniperProvider>
    </>
  )
}
