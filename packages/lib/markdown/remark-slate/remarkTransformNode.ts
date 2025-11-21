import { TDescendant, Value } from '@udecode/plate-common'

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
    const result = remarkTransformText(node, options)
    // remarkTransformText can now return elements too (for links inside marks)
    return Array.isArray(result) ? result : [result]
  }

  return remarkTransformElement(node, lastLineNumber, options)
}
