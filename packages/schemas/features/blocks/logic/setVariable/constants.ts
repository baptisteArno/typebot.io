import { SetVariableBlock } from './schema'

export const valueTypes = [
  'Custom',
  'Empty',
  'Append value(s)',
  'Environment name',
  'User ID',
  'Now',
  'Today',
  'Yesterday',
  'Tomorrow',
  'Random ID',
  'Moment of the day',
  'Map item with same index',
  'Phone number',
  'Contact name',
] as const

export const hiddenTypes = ['Today'] as const

export const defaultSetVariableOptions = {
  type: 'Custom',
  isExecutedOnClient: false,
} as const satisfies SetVariableBlock['options']
