import React from 'react'
import { PublicTypebot } from '../models'
import { TypebotContext } from '../contexts/TypebotContext'
import Frame from 'react-frame-component'
//@ts-ignore
import style from '../assets/style.css'
import { ConversationContainer } from './ConversationContainer'
import { ResultContext } from '../contexts/ResultsContext'

export type TypebotViewerProps = {
  typebot: PublicTypebot
  onNewBlockVisisble: (blockId: string) => void
}
export const TypebotViewer = ({
  typebot,
  onNewBlockVisisble,
}: TypebotViewerProps) => {
  return (
    <Frame
      id="typebot-iframe"
      head={<style>{style}</style>}
      style={{ width: '100%' }}
    >
      <TypebotContext typebot={typebot}>
        <ResultContext typebotId={typebot.id}>
          <div className="flex text-base overflow-hidden bg-cover h-screen w-screen typebot-container flex-col items-center">
            <div className="flex w-full h-full justify-center">
              <ConversationContainer
                typebot={typebot}
                onNewBlockVisisble={onNewBlockVisisble}
              />
            </div>
          </div>
        </ResultContext>
      </TypebotContext>
    </Frame>
  )
}
