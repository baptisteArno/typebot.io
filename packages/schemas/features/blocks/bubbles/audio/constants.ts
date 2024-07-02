import { AudioBubbleBlock } from './schema'

export const defaultAudioBubbleContent = {
  isAutoplayEnabled: true,
  areControlsDisplayed: true,
} as const satisfies AudioBubbleBlock['content']
