import React, { useMemo } from 'react'
import { TypebotContext } from '../contexts/TypebotContext'
import Frame from 'react-frame-component'
//@ts-ignore
import style from '../assets/style.css'
//@ts-ignore
import phoneNumberInputStyle from 'react-phone-number-input/style.css'
//@ts-ignore
import phoneSyle from '../assets/phone.css'
import { ConversationContainer } from './ConversationContainer'
import { AnswersContext } from '../contexts/AnswersContext'
import { Answer, BackgroundType, PublicTypebot } from 'models'

export type TypebotViewerProps = {
  typebot: PublicTypebot
  onNewBlockVisible?: (edgeId: string) => void
  onNewAnswer?: (answer: Answer) => void
  onCompleted?: () => void
}
export const TypebotViewer = ({
  typebot,
  onNewBlockVisible,
  onNewAnswer,
  onCompleted,
}: TypebotViewerProps) => {
  const containerBgColor = useMemo(
    () =>
      typebot?.theme?.general?.background?.type === BackgroundType.COLOR
        ? typebot.theme.general.background.content
        : 'transparent',
    [typebot?.theme?.general?.background]
  )
  const handleNewBlockVisible = (blockId: string) => {
    if (onNewBlockVisible) onNewBlockVisible(blockId)
  }
  const handleNewAnswer = (answer: Answer) => {
    if (onNewAnswer) onNewAnswer(answer)
  }
  const handleCompleted = () => {
    if (onCompleted) onCompleted()
  }

  return (
    <Frame
      id="typebot-iframe"
      head={
        <style>
          {phoneNumberInputStyle}
          {phoneSyle}
          {style}
          {typebot.theme?.customCss}
        </style>
      }
      style={{ width: '100%', height: '100%', border: 'none' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=${
            typebot?.theme?.general?.font ?? 'Open Sans'
          }:wght@300;400;600&display=swap');`,
        }}
      />
      <TypebotContext typebot={typebot}>
        <AnswersContext typebotId={typebot.id}>
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
                typebot={typebot}
                onNewBlockVisible={handleNewBlockVisible}
                onNewAnswer={handleNewAnswer}
                onCompleted={handleCompleted}
              />
            </div>
          </div>
        </AnswersContext>
      </TypebotContext>
    </Frame>
  )
}
