import { defaultButtonLabel } from '../constants'
import { DateInputBlock } from './schema'

export const defaultDateInputOptions = {
  hasTime: false,
  isRange: false,
  labels: { button: defaultButtonLabel, from: 'From:', to: 'To:' },
  format: 'dd/MM/yyyy',
  formatWithTime: 'dd/MM/yyyy HH:mm',
} as const satisfies DateInputBlock['options'] & {
  formatWithTime: string
}
