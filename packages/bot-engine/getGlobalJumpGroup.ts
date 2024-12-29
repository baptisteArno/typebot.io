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
        block.options?.text === message
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
