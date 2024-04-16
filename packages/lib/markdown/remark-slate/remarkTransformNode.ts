import { TDescendant, Value } from '@udecode/slate'

import { remarkTextTypes } from './remarkTextTypes'
import { remarkTransformElement } from './remarkTransformElement'
import { remarkTransformText } from './remarkTransformText'
import { MdastNode, RemarkPluginOptions } from './types'

export const remarkTransformNode = <V extends Value>(
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<V>
): TDescendant | TDescendant[] => {
  const { type } = node

  if (remarkTextTypes.includes(type!)) {
    return remarkTransformText(node, options)
  }

  return remarkTransformElement(node, lastLineNumber, options)
}
