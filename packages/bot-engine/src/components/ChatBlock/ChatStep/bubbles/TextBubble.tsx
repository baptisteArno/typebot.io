import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHostAvatars } from 'contexts/HostAvatarsContext'
import { useTypebot } from 'contexts/TypebotContext'
import { BubbleStepType, TextBubbleStep } from 'models'
import { computeTypingTimeout } from 'services/chat'
import { TypingContent } from './TypingContent'
import { parseVariables } from 'services/variable'

type Props = {
  step: TextBubbleStep
  onTransitionEnd: () => void
}

export const showAnimationDuration = 400

const defaultTypingEmulation = {
  enabled: true,
  speed: 300,
  maxDelay: 1.5,
}

export const TextBubble = ({ step, onTransitionEnd }: Props) => {
  const { typebot } = useTypebot()
  const { updateLastAvatarOffset } = useHostAvatars()
  const messageContainer = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)

  const content = useMemo(
    () => parseVariables(typebot.variables)(step.content.html),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typebot.variables]
  )

  useEffect(() => {
    sendAvatarOffset()
    const typingTimeout = computeTypingTimeout(
      step.content.plainText,
      typebot.settings?.typingEmulation ?? defaultTypingEmulation
    )
    setTimeout(() => {
      onTypingEnd()
    }, typingTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    updateLastAvatarOffset(
      messageContainer.current.offsetTop + containerDimensions.height
    )
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
            data-testid="host-bubble"
          >
            {isTyping ? <TypingContent /> : <></>}
          </div>
          {step.type === BubbleStepType.TEXT && (
            <p
              style={{
                textOverflow: 'ellipsis',
              }}
              className={
                'overflow-hidden content-opacity z-50 mx-4 my-2 whitespace-pre-wrap slate-html-container ' +
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
