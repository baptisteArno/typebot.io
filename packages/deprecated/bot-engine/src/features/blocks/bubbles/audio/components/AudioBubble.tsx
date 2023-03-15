import { useEffect, useRef, useState } from 'react'
import { useTypebot } from '@/providers/TypebotProvider'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { TypingBubble } from '@/components/TypingBubble'
import { parseVariables } from '@/features/variables'

type Props = {
  url: AudioBubbleContent['url']
  onTransitionEnd: () => void
}

const showAnimationDuration = 400
const typingDuration = 500

export const AudioBubble = ({ url, onTransitionEnd }: Props) => {
  const { typebot, isLoading } = useTypebot()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [isTyping, setIsTyping] = useState(true)
  const [parsedUrl] = useState(parseVariables(typebot.variables)(url))

  useEffect(() => {
    if (!isTyping || isLoading) return

    const typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setTimeout(() => {
        onTransitionEnd()
      }, showAnimationDuration)
    }, typingDuration)

    return () => {
      clearTimeout(typingTimeout)
    }
  }, [isLoading, isTyping, onTransitionEnd])

  return (
    <div className="flex flex-col">
      <div className="flex mb-2 w-full lg:w-11/12 items-center">
        <div className={'flex relative z-10 items-start typebot-host-bubble'}>
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping ? '4rem' : '100%',
              height: isTyping ? '2rem' : '100%',
            }}
          >
            {isTyping ? <TypingBubble /> : null}
          </div>
          <audio
            ref={audio}
            src={parsedUrl}
            className={
              'z-10 content-opacity m-2 ' +
              (isTyping ? 'opacity-0' : 'opacity-100')
            }
            style={{ height: isTyping ? '2rem' : 'revert' }}
            autoPlay
            controls
          />
        </div>
      </div>
    </div>
  )
}
