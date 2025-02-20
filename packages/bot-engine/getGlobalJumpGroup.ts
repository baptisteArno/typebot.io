import { SessionState } from '@typebot.io/schemas'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

export const getGlobalJumpGroup = (
  data: SessionState,
  message: string
): { blockId: string | undefined; groupId: string | undefined } | null => {
  const typebot = data?.typebotsQueue?.[0]?.typebot
  if (!typebot) return null

  for (const group of typebot.groups) {
    for (const block of group.blocks) {
      if (
        block.type === LogicBlockType.GLOBAL_JUMP &&
        block.options &&
        isMatch(block.options?.text, message)
      ) {
        return {
          groupId: block.options.groupId,
          blockId: block.id,
        }
      }
    }
  }

  return null
}

const isMatch = (text: string | undefined, message: string): boolean => {
  if (!text) return false
  const re = new RegExp(`^${text.replace('*', '.*')}$`)
  return text.includes('*') ? re.test(message) : text === message
}
