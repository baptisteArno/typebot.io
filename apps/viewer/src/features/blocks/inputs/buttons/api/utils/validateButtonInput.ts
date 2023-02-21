import { ChoiceInputBlock } from 'models'

export const validateButtonInput = (
  buttonBlock: ChoiceInputBlock,
  input: string
) =>
  buttonBlock.items.some(
    (item) =>
      item.content === input ||
      (item.content?.startsWith('{{') && item.content.endsWith('}}'))
  )
