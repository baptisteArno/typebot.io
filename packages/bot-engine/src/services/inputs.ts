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
} from 'models'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { isInputBlock } from 'utils'
import { parseVariables } from './variable'

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const urlRegex =
  /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/

export const isInputValid = (
  inputValue: string,
  type: InputBlockType
): boolean => {
  switch (type) {
    case InputBlockType.EMAIL:
      return emailRegex.test(inputValue)
    case InputBlockType.PHONE:
      return isPossiblePhoneNumber(inputValue)
    case InputBlockType.URL:
      return urlRegex.test(inputValue)
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

export const parseReadableDate = ({
  from,
  to,
  hasTime,
  isRange,
}: {
  from: string
  to: string
  hasTime?: boolean
  isRange?: boolean
}) => {
  const currentLocale = window.navigator.language
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: hasTime ? '2-digit' : undefined,
    minute: hasTime ? '2-digit' : undefined,
  }
  const fromReadable = new Date(from).toLocaleString(
    currentLocale,
    formatOptions
  )
  const toReadable = new Date(to).toLocaleString(currentLocale, formatOptions)
  return `${fromReadable}${isRange ? ` to ${toReadable}` : ''}`
}
