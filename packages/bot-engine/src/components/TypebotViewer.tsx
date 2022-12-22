import { CSSProperties, useMemo } from 'react'
import { TypebotProvider } from '../providers/TypebotProvider'
import Frame from 'react-frame-component'
import styles from '../assets/style.css'
import importantStyles from '../assets/importantStyles.css'
import phoneSyle from '../assets/phone.css'
import { ConversationContainer } from './ConversationContainer'
import { AnswersProvider } from '../providers/AnswersProvider'
import {
  AnswerInput,
  BackgroundType,
  Edge,
  PublicTypebot,
  VariableWithValue,
} from 'models'
import { Log } from 'db'
import { LiteBadge } from './LiteBadge'
import { getViewerUrl, isEmpty } from 'utils'

export type TypebotViewerProps = {
  typebot: Omit<PublicTypebot, 'updatedAt' | 'createdAt'>
  isPreview?: boolean
  apiHost?: string
  style?: CSSProperties
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

export const TypebotViewer = ({
  typebot,
  apiHost = getViewerUrl(),
  isPreview = false,
  isLoading = false,
  style,
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
        : 'transparent',
    [typebot?.theme?.general?.background]
  )
  const handleNewGroupVisible = (edge: Edge) =>
    onNewGroupVisible && onNewGroupVisible(edge)

  const handleNewAnswer = (answer: AnswerInput & { uploadedFiles: boolean }) =>
    onNewAnswer && onNewAnswer(answer)

  const handleNewLog = (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) =>
    onNewLog && onNewLog(log)

  const handleCompleted = () => onCompleted && onCompleted()

  if (isEmpty(apiHost))
    return <p>process.env.NEXT_PUBLIC_VIEWER_URL is missing in env</p>
  return (
    <Frame
      id="typebot-iframe"
      head={
        <style>
          {phoneSyle}
          {styles}
          {typebot.theme?.customCss}
          {importantStyles}
        </style>
      }
      name="Typebot viewer"
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=${
            typebot?.theme?.general?.font ?? 'Open Sans'
          }:wght@300;400;600&display=swap');`,
        }}
      />
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
              backgroundColor: containerBgColor ?? 'transparent',
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
            {typebot.settings.general.isBrandingEnabled && <LiteBadge />}
          </div>
        </AnswersProvider>
      </TypebotProvider>
    </Frame>
  )
}
