import { TypingEmulation } from '@typebot.io/schemas'

export const computeTypingDuration = (
  bubbleContent: string,
  typingSettings: TypingEmulation
) => {
  let wordCount = bubbleContent.match(/(\w+)/g)?.length ?? 0
  if (wordCount === 0) wordCount = bubbleContent.length
  const typedWordsPerMinute = typingSettings.speed
  let typingTimeout = typingSettings.enabled
    ? (wordCount / typedWordsPerMinute) * 60000
    : 0
  if (typingTimeout > typingSettings.maxDelay * 1000)
    typingTimeout = typingSettings.maxDelay * 1000
  return typingTimeout
}
