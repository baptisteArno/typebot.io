import { defaultButtonLabel } from '../constants'
import { NumberInputBlock } from './schema'

export const defaultNumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: 'Type a number...' },
} as const satisfies NumberInputBlock['options']
