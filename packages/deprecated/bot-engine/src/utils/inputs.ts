import { validateEmail } from '@/features/blocks/inputs/email'
import { validatePhoneNumber } from '@/features/blocks/inputs/phone'
import { validateUrl } from '@/features/blocks/inputs/url'
import { parseVariables } from '@/features/variables'
import {
  BubbleBlock,
  BubbleBlockType,
  Edge,
  EmailInputBlock,
  InputBlockType,
  PhoneNumberInputBlock,
  Block,
  UrlInputBlock,
  Variable,
} from '@typebot.io/schemas'
import { isInputBlock } from '@typebot.io/lib'

export const isInputValid = (
  inputValue: string,
  type: InputBlockType
): boolean => {
  switch (type) {
    case InputBlockType.EMAIL:
      return validateEmail(inputValue)
    case InputBlockType.PHONE:
      return validatePhoneNumber(inputValue)
    case InputBlockType.URL:
      return validateUrl(inputValue)
  }
  return true
}

export const blockCanBeRetried = (
  block: Block
): block is EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock =>
  isInputBlock(block) && 'retryMessageContent' in block.options

export const parseRetryBlock = (
  block: EmailInputBlock | UrlInputBlock | PhoneNumberInputBlock,
  variables: Variable[],
  createEdge: (edge: Edge) => void
): BubbleBlock => {
  const content = parseVariables(variables)(block.options.retryMessageContent)
  const newBlockId = block.id + Math.random() * 1000
  const newEdge: Edge = {
    id: (Math.random() * 1000).toString(),
    from: { blockId: newBlockId, groupId: block.groupId },
    to: { groupId: block.groupId, blockId: block.id },
  }
  createEdge(newEdge)
  return {
    groupId: block.groupId,
    id: newBlockId,
    type: BubbleBlockType.TEXT,
    content: {
      html: `<div>${content}</div>`,
      richText: [],
      plainText: content,
    },
    outgoingEdgeId: newEdge.id,
  }
}
