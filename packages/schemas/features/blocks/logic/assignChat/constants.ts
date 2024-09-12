import { AssignChatBlock } from './schema'

export const defaultAssignChatOptions = {
  assignType: 'Agent',
  email: '',
} as const satisfies AssignChatBlock['options']
