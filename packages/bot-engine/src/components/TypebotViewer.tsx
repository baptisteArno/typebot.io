import React, { useMemo } from 'react'
import { Answer, BackgroundType, PublicTypebot } from '../models'
import { TypebotContext } from '../contexts/TypebotContext'
import Frame from 'react-frame-component'
//@ts-ignore
import style from '../assets/style.css'
import { ConversationContainer } from './ConversationContainer'
import { AnswersContext } from '../contexts/AnswersContext'

export type TypebotViewerProps = {
  typebot: PublicTypebot
  onNewBlockVisible?: (blockId: string) => void
  onAnswersUpdate?: (answers: Answer[]) => void
  onCompleted?: () => void
}
export const TypebotViewer = ({
  typebot,
  onNewBlockVisible,
  onAnswersUpdate,
  onCompleted,
}: TypebotViewerProps) => {
  const containerBgColor = useMemo(
    () =>
      typebot.theme.general.background.type === BackgroundType.COLOR
        ? typebot.theme.general.background.content
        : 'transparent',
    [typebot.theme.general.background]
  )
  const handleNewBlockVisible = (blockId: string) => {
    if (onNewBlockVisible) onNewBlockVisible(blockId)
  }
  const handleAnswersUpdate = (answers: Answer[]) => {
    if (onAnswersUpdate) onAnswersUpdate(answers)
  }
  const handleCompleted = () => {
    if (onCompleted) onCompleted()
  }

  return (
    <Frame
      id="typebot-iframe"
      head={<style>{style}</style>}
      style={{ width: '100%', height: '100%', border: 'none' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=${typebot.theme.general.font}:wght@300;400;600&display=swap');`,
        }}
      />
      <TypebotContext typebot={typebot}>
        <AnswersContext typebotId={typebot.id}>
          <div
            className="flex text-base overflow-hidden bg-cover h-screen w-screen flex-col items-center typebot-container"
            style={{
              // We set this as inline style to avoid color flash for SSR
              backgroundColor: containerBgColor,
            }}
          >
            <div className="flex w-full h-full justify-center">
              <ConversationContainer
                typebot={typebot}
                onNewBlockVisible={handleNewBlockVisible}
                onAnswersUpdate={handleAnswersUpdate}
                onCompleted={handleCompleted}
              />
            </div>
          </div>
        </AnswersContext>
      </TypebotContext>
    </Frame>
  )
}
