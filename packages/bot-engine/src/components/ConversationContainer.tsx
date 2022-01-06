import React, { useEffect, useRef, useState } from 'react'

import { ChatBlock } from './ChatBlock/ChatBlock'
import { useFrame } from 'react-frame-component'
import { setCssVariablesValue } from '../services/theme'
import { useAnswers } from '../contexts/AnswersContext'
import { deepEqual } from 'fast-equals'
import { Answer, Block, PublicTypebot } from 'models'
import { filterTable } from 'utils'

type Props = {
  typebot: PublicTypebot
  onNewBlockVisible: (blockId: string) => void
  onNewAnswer: (answer: Answer) => void
  onCompleted: () => void
}
export const ConversationContainer = ({
  typebot,
  onNewBlockVisible,
  onNewAnswer,
  onCompleted,
}: Props) => {
  const { document: frameDocument } = useFrame()
  const [displayedBlocks, setDisplayedBlocks] = useState<Block[]>([])
  const [localAnswer, setLocalAnswer] = useState<Answer | undefined>()
  const { answers } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)

  const displayNextBlock = (blockId?: string) => {
    if (!blockId) return onCompleted()
    const nextBlock = typebot.blocks.byId[blockId]
    if (!nextBlock) return onCompleted()
    onNewBlockVisible(blockId)
    setDisplayedBlocks([...displayedBlocks, nextBlock])
  }

  useEffect(() => {
    const blocks = typebot.blocks
    const firstBlockId =
      typebot.steps.byId[blocks.byId[blocks.allIds[0]].stepIds[0]].target
        ?.blockId
    if (firstBlockId) displayNextBlock(firstBlockId)
  }, [])

  useEffect(() => {
    setCssVariablesValue(typebot.theme, frameDocument.body.style)
  }, [typebot.theme, frameDocument])

  useEffect(() => {
    const answer = [...answers].pop()
    if (!answer || deepEqual(localAnswer, answer)) return
    setLocalAnswer(answer)
    onNewAnswer(answer)
  }, [answers])

  return (
    <div
      className="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view"
      id="scrollable-container"
    >
      {displayedBlocks.map((block, idx) => (
        <ChatBlock
          key={block.id + idx}
          steps={filterTable(block.stepIds, typebot.steps)}
          onBlockEnd={displayNextBlock}
        />
      ))}
      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full" ref={bottomAnchor} />
    </div>
  )
}
