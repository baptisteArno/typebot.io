import React, { useEffect, useRef, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { BubbleBlockType, TextBubbleBlock } from 'models'
import { computeTypingTimeout } from 'services/chat'
import { TypingContent } from './TypingContent'
import { parseVariables } from 'services/variable'

type Props = {
  block: TextBubbleBlock
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

const defaultTypingEmulation = {
  enabled: true,
  speed: 300,
  maxDelay: 1.5,
}

export const TextBubble = ({ block, onTransitionEnd }: Props) => {
  const { typebot, isLoading } = useTypebot()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)

  const [content] = useState(
    parseVariables(typebot.variables)(block.content.html)
  )

  useEffect(() => {
    if (!isTyping || isLoading) return
    const typingTimeout = computeTypingTimeout(
      block.content.plainText,
      typebot.settings?.typingEmulation ?? defaultTypingEmulation
    )
    setTimeout(() => {
      onTypingEnd()
    }, typingTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const onTypingEnd = () => {
    setIsTyping(false)
    setTimeout(() => {
      onTransitionEnd()
    }, showAnimationDuration)
  }

  return (
    <div className="flex flex-col" ref={messageContainer}>
      <div className="flex mb-2 w-full items-center">
        <div className={'flex relative items-start typebot-host-bubble'}>
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing "
            style={{
              width: isTyping ? '4rem' : '100%',
              height: isTyping ? '2rem' : '100%',
            }}
            data-testid="host-bubble"
          >
            {isTyping ? <TypingContent /> : <></>}
          </div>
          {block.type === BubbleBlockType.TEXT && (
            <p
              style={{
                textOverflow: 'ellipsis',
              }}
              className={
                'overflow-hidden content-opacity mx-4 my-2 whitespace-pre-wrap slate-html-container relative ' +
                (isTyping ? 'opacity-0 h-6' : 'opacity-100 h-full')
              }
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
