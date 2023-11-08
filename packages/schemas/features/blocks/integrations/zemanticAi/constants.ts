import { ZemanticAiBlock } from './schema'

export const searchResponseValues = ['Summary', 'Results'] as const

export const defaultZemanticAiOptions = {
  maxResults: 3,
} as const satisfies ZemanticAiBlock['options']

export const defaultZemanticAiResponseMappingItem = {
  valueToExtract: 'Summary',
} as const
