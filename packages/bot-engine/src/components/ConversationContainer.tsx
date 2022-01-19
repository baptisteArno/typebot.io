import React, { useEffect, useRef, useState } from 'react'

import { ChatBlock } from './ChatBlock/ChatBlock'
import { useFrame } from 'react-frame-component'
import { setCssVariablesValue } from '../services/theme'
import { useAnswers } from '../contexts/AnswersContext'
import { deepEqual } from 'fast-equals'
import { Answer, Block, Edge, PublicTypebot } from 'models'

type Props = {
  typebot: PublicTypebot
  onNewBlockVisible: (edgeId: string) => void
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
    { block: Block; startStepId?: string }[]
  >([])
  const [localAnswer, setLocalAnswer] = useState<Answer | undefined>()
  const { answers } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)

  const displayNextBlock = (edgeId?: string) => {
    const edge = typebot.edges.byId[edgeId ?? '']
    if (!edge) return onCompleted()
    const nextBlock = {
      block: typebot.blocks.byId[edge.to.blockId],
      startStepId: edge.to.stepId,
    }
    if (!nextBlock) return onCompleted()
    onNewBlockVisible(edge.id)
    setDisplayedBlocks([...displayedBlocks, nextBlock])
  }

  useEffect(() => {
    const blocks = typebot.blocks
    const firstEdgeId =
      typebot.steps.byId[blocks.byId[blocks.allIds[0]].stepIds[0]].edgeId
    if (!firstEdgeId) return
    displayNextBlock(firstEdgeId)
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
      {displayedBlocks.map((displayedBlock, idx) => (
        <ChatBlock
          key={displayedBlock.block.id + idx}
          stepIds={displayedBlock.block.stepIds}
          startStepId={displayedBlock.startStepId}
          onBlockEnd={displayNextBlock}
        />
      ))}
      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full" ref={bottomAnchor} />
    </div>
  )
}
