import { TDescendant, Value } from '@udecode/plate-common'

import { remarkTransformNode } from './remarkTransformNode'
import { remarkTransformText } from './remarkTransformText'
import { remarkTextTypes } from './remarkTextTypes'
import { MdastNode, RemarkPluginOptions } from './types'

export const remarkTransformElementChildren = <V extends Value>(
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<V>,
  inheritedMarkProps: { [key: string]: boolean } = {}
): TDescendant[] => {
  const { children } = node
  if (!children) return []

  return children.flatMap((child) => {
    // If we have inherited marks and this is a text node, pass the marks
    if (
      Object.keys(inheritedMarkProps).length > 0 &&
      remarkTextTypes.includes(child.type!)
    ) {
      const result = remarkTransformText(child, options, inheritedMarkProps)
      return Array.isArray(result) ? result : [result]
    }

    return remarkTransformNode(child, lastLineNumber, options)
  })
}
