import { AudioBubbleBlock } from './schema'

export const defaultAudioBubbleContent = {
  isAutoplayEnabled: true,
} as const satisfies AudioBubbleBlock['content']
