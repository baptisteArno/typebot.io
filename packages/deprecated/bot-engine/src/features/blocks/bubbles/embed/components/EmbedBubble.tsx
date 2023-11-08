import { useCallback, useEffect, useRef, useState } from 'react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'
import { TypingBubble } from '../../../../../components/TypingBubble'
import { parseVariables } from '@/features/variables'
import { useTypebot } from '@/providers/TypebotProvider'

type Props = {
  block: EmbedBubbleBlock
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const EmbedBubble = ({ block, onTransitionEnd }: Props) => {
  const { typebot, isLoading } = useTypebot()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)
  const [url] = useState(parseVariables(typebot.variables)(block.content?.url))

  const onTypingEnd = useCallback(() => {
    setIsTyping(false)
    setTimeout(() => {
      onTransitionEnd()
    }, showAnimationDuration)
  }, [onTransitionEnd])

  useEffect(() => {
    if (!isTyping || isLoading) return
    const timeout = setTimeout(() => {
      setIsTyping(false)
      onTypingEnd()
    }, 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading, isTyping, onTypingEnd])

  const height = block.content?.height
    ? typeof block.content.height === 'string'
      ? parseVariables(typebot.variables)(block.content.height) + 'px'
      : block.content.height
    : '2rem'

  return (
    <div className="flex flex-col w-full" ref={messageContainer}>
      <div className="flex mb-2 w-full lg:w-11/12 items-center">
        <div
          className={
            'flex relative z-10 items-start typebot-host-bubble w-full'
          }
        >
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping ? '4rem' : '100%',
              height: isTyping ? '2rem' : '100%',
            }}
          >
            {isTyping ? <TypingBubble /> : <></>}
          </div>
          <iframe
            id="embed-bubble-content"
            src={url}
            className={
              'w-full z-20 p-4 content-opacity ' +
              (isTyping ? 'opacity-0' : 'opacity-100')
            }
            style={{
              height: isTyping ? '2rem' : height,
              borderRadius: '15px',
            }}
          />
        </div>
      </div>
    </div>
  )
}
