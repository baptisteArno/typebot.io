import { ChoiceInputBlock } from 'models'

export const validateButtonInput = (
  buttonBlock: ChoiceInputBlock,
  input: string
) =>
  input
    .split(',')
    .every((value) =>
      buttonBlock.items.some((item) => item.content === value.trim())
    )
