import { Settings } from '@typebot.io/schemas/features/typebot/settings'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'

type Props = {
  bubbleContent: string
  typingSettings?: Settings['typingEmulation']
}

export const computeTypingDuration = ({
  bubbleContent,
  typingSettings,
}: Props) => {
  let wordCount = bubbleContent.match(/(\w+)/g)?.length ?? 0
  if (wordCount === 0) wordCount = bubbleContent.length
  const { enabled, speed, maxDelay } = {
    enabled: typingSettings?.enabled ?? defaultSettings.typingEmulation.enabled,
    speed: typingSettings?.speed ?? defaultSettings.typingEmulation.speed,
    maxDelay:
      typingSettings?.maxDelay ?? defaultSettings.typingEmulation.maxDelay,
  }
  const typedWordsPerMinute = speed
  let typingTimeout = enabled ? (wordCount / typedWordsPerMinute) * 60000 : 0
  if (typingTimeout > maxDelay * 1000) typingTimeout = maxDelay * 1000
  return typingTimeout
}
