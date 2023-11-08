import { defaultButtonLabel } from '../constants'
import { TextInputBlock } from './schema'

export const defaultTextInputOptions = {
  isLong: false,
  labels: { button: defaultButtonLabel, placeholder: 'Type your answer...' },
} as const satisfies TextInputBlock['options']
