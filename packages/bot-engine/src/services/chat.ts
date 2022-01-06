import { TypingEmulationSettings } from 'models'

export const computeTypingTimeout = (
  bubbleContent: string,
  typingSettings: TypingEmulationSettings
) => {
  const wordCount = bubbleContent.match(/(\w+)/g)?.length ?? 0
  const typedWordsPerMinute = typingSettings.speed
  let typingTimeout = typingSettings.enabled
    ? (wordCount / typedWordsPerMinute) * 60000
    : 0
  if (typingTimeout > typingSettings.maxDelay * 1000)
    typingTimeout = typingSettings.maxDelay * 1000
  return typingTimeout
}
