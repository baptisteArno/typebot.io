import React, { useEffect, useRef, useState } from 'react'

import { ChatBlock } from './ChatBlock/ChatBlock'
import { useFrame } from 'react-frame-component'
import { setCssVariablesValue } from '../services/theme'
import { useAnswers } from '../contexts/AnswersContext'
import { deepEqual } from 'fast-equals'
import { Answer, Edge, PublicBlock, PublicTypebot } from 'models'
import { byId } from 'utils'

type Props = {
  typebot: PublicTypebot
  onNewBlockVisible: (edge: Edge) => void
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
  const [displayedBlocks, setDisplayedBlocks] = useState<
    { block: PublicBlock; startStepIndex: number }[]
  >([])
  const [localAnswer, setLocalAnswer] = useState<Answer | undefined>()
  const { answers } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)

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
    setCssVariablesValue(typebot.theme, frameDocument.body.style)
  }, [typebot.theme, frameDocument])

  useEffect(() => {
    const answer = [...answers].pop()
    if (!answer || deepEqual(localAnswer, answer)) return
    setLocalAnswer(answer)
    onNewAnswer(answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers])

  return (
    <div
      className="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view"
      id="scrollable-container"
    >
      {displayedBlocks.map((displayedBlock, idx) => (
        <ChatBlock
          key={displayedBlock.block.id + idx}
          steps={displayedBlock.block.steps}
          startStepIndex={displayedBlock.startStepIndex}
          blockIndex={idx}
          onBlockEnd={displayNextBlock}
        />
      ))}
      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full" ref={bottomAnchor} />
    </div>
  )
}
