import React, { useEffect, useRef, useState } from 'react'
import { PublicTypebot } from '..'

import { Block } from '..'
import { ChatBlock } from './ChatBlock/ChatBlock'

export const ConversationContainer = ({
  typebot,
  onNewBlockVisisble,
}: {
  typebot: PublicTypebot
  onNewBlockVisisble: (blockId: string) => void
}) => {
  const [displayedBlocks, setDisplayedBlocks] = useState<Block[]>([])

  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const bottomAnchor = useRef<HTMLDivElement | null>(null)

  const displayNextBlock = (blockId: string) => {
    const nextBlock = typebot.blocks.find((b) => b.id === blockId)
    if (!nextBlock) return
    onNewBlockVisisble(blockId)
    setDisplayedBlocks([...displayedBlocks, nextBlock])
  }

  useEffect(() => {
    const firstBlockId = typebot.startBlock.steps[0].target?.blockId
    if (firstBlockId) displayNextBlock(firstBlockId)
  }, [])

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
      <div
        className="w-full"
        ref={bottomAnchor}
        style={{
          transition: isConversationEnded ? 'height 1s' : '',
          height: isConversationEnded ? '5%' : '20%',
        }}
      />
    </div>
  )
}
