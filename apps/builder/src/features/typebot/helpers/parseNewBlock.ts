import { createId } from '@paralleldrive/cuid2'
import { blockTypeHasItems } from '@typebot.io/schemas/helpers'
import { BlockV6, BlockWithItems, ItemV6 } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'

const parseDefaultItems = (type: BlockWithItems['type']): ItemV6[] => {
  switch (type) {
    case InputBlockType.CHOICE:
      return [{ id: createId() }]
    case InputBlockType.PICTURE_CHOICE:
      return [{ id: createId() }]
    case LogicBlockType.CONDITION:
      return [
        {
          id: createId(),
        },
      ]
    case LogicBlockType.AB_TEST:
      return [
        { id: createId(), path: 'a' },
        { id: createId(), path: 'b' },
      ]
  }
}

export const parseNewBlock = (type: BlockV6['type']) => {
  const baseBlock = {
    id: createId(),
    type,
    ...(blockTypeHasItems(type)
      ? { items: parseDefaultItems(type) }
      : undefined),
  } as BlockV6

  // Auto-select action for forge blocks with only one action
  if (type in forgedBlocks) {
    const forgedBlock = forgedBlocks[type as keyof typeof forgedBlocks]
    if (forgedBlock?.actions && forgedBlock.actions.length === 1) {
      return {
        ...baseBlock,
        options: {
          action: forgedBlock.actions[0].name,
        },
      } as BlockV6
    }
  }

  return baseBlock
}
