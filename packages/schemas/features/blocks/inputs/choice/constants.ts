import { defaultButtonLabel } from '../constants'
import { ChoiceInputBlock } from './schema'

export const defaultChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  searchInputPlaceholder: 'Filter the options...',
  isMultipleChoice: false,
  enableValidateButton: true,
  buttonValidationMessage: 'Invalid message. Please, try again.',
  isSearchable: false,
} as const satisfies ChoiceInputBlock['options']
