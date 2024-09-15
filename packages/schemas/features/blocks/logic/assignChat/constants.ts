export enum assignChatType {
  AGENT = 'agent',
  TEAM = 'team',
  HANDOVER = 'handover',
}

export const assignChatTypeOptions = [
  assignChatType.AGENT,
  assignChatType.TEAM,
  assignChatType.HANDOVER,
] as const satisfies assignChatType[]
