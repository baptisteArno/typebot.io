import React, { useEffect, useRef, useState } from 'react'

import { ChatBlock } from './ChatBlock/ChatBlock'
import { useFrame } from 'react-frame-component'
import { setCssVariablesValue } from '../services/theme'
import { useAnswers } from '../contexts/AnswersContext'
import { deepEqual } from 'fast-equals'
import { Answer, Edge, PublicBlock, Theme } from 'models'
import { byId } from 'utils'
import { animateScroll as scroll } from 'react-scroll'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  theme: Theme
  onNewBlockVisible: (edge: Edge) => void
  onNewAnswer: (answer: Answer) => void
  onCompleted: () => void
}
export const ConversationContainer = ({
  theme,
  onNewBlockVisible,
  onNewAnswer,
  onCompleted,
}: Props) => {
  const { typebot } = useTypebot()
  const { document: frameDocument } = useFrame()
  const [displayedBlocks, setDisplayedBlocks] = useState<
    { block: PublicBlock; startStepIndex: number }[]
  >([])
  const [localAnswer, setLocalAnswer] = useState<Answer | undefined>()
  const { answers } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)
  const scrollableContainer = useRef<HTMLDivElement | null>(null)

  const displayNextBlock = (edgeId?: string) => {
    const nextEdge = typebot.edges.find(byId(edgeId))
    if (!nextEdge) return onCompleted()
    const nextBlock = typebot.blocks.find(byId(nextEdge.to.blockId))
    if (!nextBlock) return onCompleted()
    const startStepIndex = nextEdge.to.stepId
      ? nextBlock.steps.findIndex(byId(nextEdge.to.stepId))
      : 0
    onNewBlockVisible(nextEdge)
    setDisplayedBlocks([
      ...displayedBlocks,
      { block: nextBlock, startStepIndex },
    ])
  }

  useEffect(() => {
    displayNextBlock(typebot.blocks[0].steps[0].outgoingEdgeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCssVariablesValue(theme, frameDocument.body.style)
  }, [theme, frameDocument])

  useEffect(() => {
    const answer = [...answers].pop()
    if (!answer || deepEqual(localAnswer, answer)) return
    setLocalAnswer(answer)
    onNewAnswer(answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers])

  const autoScrollToBottom = () => {
    if (!scrollableContainer.current) return
    scroll.scrollToBottom({
      duration: 500,
      container: scrollableContainer.current,
    })
  }

  return (
    <div
      ref={scrollableContainer}
      className="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view"
    >
      {displayedBlocks.map((displayedBlock, idx) => (
        <ChatBlock
          key={displayedBlock.block.id + idx}
          steps={displayedBlock.block.steps}
          startStepIndex={displayedBlock.startStepIndex}
          onScroll={autoScrollToBottom}
          onBlockEnd={displayNextBlock}
        />
      ))}
      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full h-32" ref={bottomAnchor} />
    </div>
  )
}
