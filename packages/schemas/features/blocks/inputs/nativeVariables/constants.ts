import { NativeVariablesBlock } from './schema'
import { InputBlockType } from '../constants'

export const defaultNativeVariablesOptions = {
  nativeType: 'helpdeskId' as const,
}

export const nativeVariableTypes = [
  { value: 'helpdeskId', label: 'Helpdesk ID' },
  { value: 'cloudChatId', label: 'Cloud Chat ID' },
  { value: 'activeIntent', label: 'Active Intent' },
  { value: 'channelType', label: 'Channel Type' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'lastUserMessages', label: 'Last User Messages' },
  { value: 'messages', label: 'Messages' },
] as const

export type NativeVariableType = (typeof nativeVariableTypes)[number]['value']

export const defaultNativeVariablesBlock: NativeVariablesBlock = {
  id: '',
  type: InputBlockType.NATIVE_VARIABLES,
  options: defaultNativeVariablesOptions,
}
