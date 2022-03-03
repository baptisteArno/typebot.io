import {
  BubbleStep,
  BubbleStepType,
  InputStep,
  InputStepType,
  Step,
  TypingEmulation,
} from 'models'
import { isBubbleStep, isInputStep } from 'utils'

export const computeTypingTimeout = (
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

export const getLastChatStepType = (
  steps: Step[]
): BubbleStepType | InputStepType | undefined => {
  const displayedSteps = steps.filter(
    (s) => isBubbleStep(s) || isInputStep(s)
  ) as (BubbleStep | InputStep)[]
  return displayedSteps.pop()?.type
}
