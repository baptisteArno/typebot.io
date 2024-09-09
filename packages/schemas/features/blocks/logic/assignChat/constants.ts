import { AssignChatBlock } from './schema'

export const defaultRedirectOptions = {
  email: '',
} as const satisfies AssignChatBlock['options']
