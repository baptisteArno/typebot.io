import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { ImageBubbleStep } from 'models'
import { TypingContent } from './TypingContent'
import { parseVariables } from 'services/variable'

type Props = {
  step: ImageBubbleStep
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const mediaLoadingFallbackTimeout = 5000

export const ImageBubble = ({ step, onTransitionEnd }: Props) => {
  const { typebot } = useTypebot()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)
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
    if (!image.current) return
    const timeout = setTimeout(() => {
      setIsTyping(false)
      onTypingEnd()
    }, mediaLoadingFallbackTimeout)
    image.current.onload = () => {
      clearTimeout(timeout)
      setIsTyping(false)
      onTypingEnd()
    }
  }

  const onTypingEnd = () => {
    setIsTyping(false)
    setTimeout(() => {
      onTransitionEnd()
    }, showAnimationDuration)
  }

  return (
    <div className="flex flex-col" ref={messageContainer}>
      <div className="flex mb-2 w-full lg:w-11/12 items-center">
        <div className={'flex relative z-10 items-start typebot-host-bubble'}>
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping ? '4rem' : '100%',
              height: isTyping ? '2rem' : '100%',
            }}
          >
            {isTyping ? <TypingContent /> : <></>}
          </div>
          <img
            ref={image}
            src={url}
            className={
              'p-4 content-opacity z-10 w-auto ' +
              (isTyping ? 'opacity-0' : 'opacity-100')
            }
            style={{
              maxHeight: '32rem',
              height: isTyping ? '2rem' : 'auto',
              maxWidth: '100%',
            }}
            alt="Bubble image"
          />
        </div>
      </div>
    </div>
  )
}
