import { defaultButtonLabel } from '../constants'
import { TextInputBlock } from './schema'

export const defaultTextInputOptions = {
  isLong: false,
  labels: { button: defaultButtonLabel, placeholder: 'Type your answer...' },
  audioClip: {
    isEnabled: false,
    visibility: 'Auto',
  },
  attachments: {
    isEnabled: false,
    visibility: 'Auto',
  },
} as const satisfies TextInputBlock['options']
