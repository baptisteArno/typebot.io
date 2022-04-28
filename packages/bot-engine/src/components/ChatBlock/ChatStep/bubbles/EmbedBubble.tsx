import React, { useEffect, useMemo, useRef, useState } from 'react'
import { EmbedBubbleStep } from 'models'
import { TypingContent } from './TypingContent'
import { parseVariables } from 'services/variable'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: EmbedBubbleStep
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const EmbedBubble = ({ step, onTransitionEnd }: Props) => {
  const { typebot } = useTypebot()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)

  const url = useMemo(
    () => parseVariables(typebot.variables)(step.content?.url),
    [step.content?.url, typebot.variables]
  )

  useEffect(() => {
    showContentAfterMediaLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showContentAfterMediaLoad = () => {
    setTimeout(() => {
      setIsTyping(false)
      onTypingEnd()
    }, 1000)
  }

  const onTypingEnd = () => {
    setIsTyping(false)
    setTimeout(() => {
      onTransitionEnd()
    }, showAnimationDuration)
  }

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
            {isTyping ? <TypingContent /> : <></>}
          </div>
          <iframe
            id="embed-bubble-content"
            src={url}
            className={
              'w-full z-20 p-4 content-opacity ' +
              (isTyping ? 'opacity-0' : 'opacity-100')
            }
            style={{
              height: isTyping ? '2rem' : step.content.height,
              borderRadius: '15px',
            }}
          />
        </div>
      </div>
    </div>
  )
}
