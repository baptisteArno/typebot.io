export enum LogicBlockType {
  SET_VARIABLE = 'Set variable',
  CONDITION = 'Condition',
  REDIRECT = 'Redirect',
  SCRIPT = 'Code',
  TYPEBOT_LINK = 'Typebot link',
  WAIT = 'Wait',
  JUMP = 'Jump',
  AB_TEST = 'AB test',
  ASSIGN_CHAT = 'Assign Chat',
  CLOSE_CHAT = 'Close Chat',
}

export const assignChatTypeOptions = ['Agent', 'Team', 'Handover'] as const
