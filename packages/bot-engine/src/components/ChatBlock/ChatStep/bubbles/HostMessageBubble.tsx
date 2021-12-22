import React, { useEffect, useRef, useState } from 'react'
import { useHostAvatars } from '../../../../contexts/HostAvatarsContext'
import { StepType, TextStep } from '../../../../models'
import { TypingContent } from './TypingContent'

type HostMessageBubbleProps = {
  step: TextStep
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

export const mediaLoadingFallbackTimeout = 5000

export const HostMessageBubble = ({
  step,
  onTransitionEnd,
}: HostMessageBubbleProps) => {
  const { updateLastAvatarOffset } = useHostAvatars()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const wordCount = step.content.plainText.match(/(\w+)/g)?.length ?? 0
    const typedWordsPerMinute = 250
    const typingTimeout = (wordCount / typedWordsPerMinute) * 60000
    sendAvatarOffset()
    setTimeout(() => {
      onTypingEnd()
    }, typingTimeout)
  }, [])

  const onTypingEnd = () => {
    setIsTyping(false)
    setTimeout(() => {
      sendAvatarOffset()
      onTransitionEnd()
    }, showAnimationDuration)
  }

  const sendAvatarOffset = () => {
    if (!messageContainer.current) return
    const containerDimensions = messageContainer.current.getBoundingClientRect()
    updateLastAvatarOffset(containerDimensions.top + containerDimensions.height)
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
          {step.type === StepType.TEXT && (
            <p
              style={{
                textOverflow: 'ellipsis',
              }}
              className={
                'overflow-hidden content-opacity z-50 mx-4 my-2 whitespace-pre-wrap slate-html-container ' +
                (isTyping ? 'opacity-0 h-6' : 'opacity-100 h-full')
              }
              dangerouslySetInnerHTML={{
                __html: step.content.html,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
