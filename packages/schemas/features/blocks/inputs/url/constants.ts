import { defaultButtonLabel } from '../constants'
import { UrlInputBlock } from './schema'

export const defaultUrlInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: 'Type a URL...',
  },
  retryMessageContent:
    "This URL doesn't seem to be valid. Can you type it again?",
} as const satisfies UrlInputBlock['options']
