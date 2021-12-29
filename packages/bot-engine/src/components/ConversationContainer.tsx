import React, { useEffect, useRef, useState } from 'react'
import { Answer, PublicTypebot } from '..'

import { Block } from '..'
import { ChatBlock } from './ChatBlock/ChatBlock'
import { useFrame } from 'react-frame-component'
import { setCssVariablesValue } from '../services/theme'
import { useAnswers } from '../contexts/AnswersContext'
import { deepEqual } from 'fast-equals'

type Props = {
  typebot: PublicTypebot
  onNewBlockVisible: (blockId: string) => void
  onAnswersUpdate: (answers: Answer[]) => void
  onCompleted: () => void
}
export const ConversationContainer = ({
  typebot,
  onNewBlockVisible,
  onAnswersUpdate,
  onCompleted,
}: Props) => {
  const { document: frameDocument } = useFrame()
  const [displayedBlocks, setDisplayedBlocks] = useState<Block[]>([])
  const [localAnswers, setLocalAnswers] = useState<Answer[]>([])
  const { answers } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)

  const displayNextBlock = (blockId?: string) => {
    if (!blockId) return onCompleted()
    const nextBlock = typebot.blocks.find((b) => b.id === blockId)
    if (!nextBlock) return onCompleted()
    onNewBlockVisible(blockId)
    setDisplayedBlocks([...displayedBlocks, nextBlock])
  }

  useEffect(() => {
    const firstBlockId = typebot.startBlock.steps[0].target?.blockId
    if (firstBlockId) displayNextBlock(firstBlockId)
  }, [])

  useEffect(() => {
    setCssVariablesValue(typebot.theme, frameDocument.body.style)
  }, [typebot.theme, frameDocument])

  useEffect(() => {
    if (deepEqual(localAnswers, answers)) return
    setLocalAnswers(answers)
    onAnswersUpdate(answers)
  }, [answers])

  return (
    <div
      className="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view"
      id="scrollable-container"
    >
      {displayedBlocks.map((block, idx) => (
        <ChatBlock
          key={block.id + idx}
          block={block}
          onBlockEnd={displayNextBlock}
        />
      ))}
      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full" ref={bottomAnchor} />
    </div>
  )
}
