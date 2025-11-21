import { TText, Value, TElement, getPluginType } from '@udecode/plate-common'
import { ELEMENT_LINK } from '@udecode/plate-link'

import { remarkDefaultTextRules } from './remarkDefaultTextRules'
import { remarkTransformElementChildren } from './remarkTransformElementChildren'
import { MdastNode, RemarkPluginOptions } from './types'

export const remarkTransformText = <V extends Value>(
  node: MdastNode,
  options: RemarkPluginOptions<V>,
  inheritedMarkProps: { [key: string]: boolean } = {}
): TText | TText[] | TElement | (TText | TElement)[] => {
  const { editor, textRules } = options

  const { type, value, children } = node

  // Handle link elements specially when they appear inside text marks
  if (type === 'link') {
    return {
      type: getPluginType(options.editor, ELEMENT_LINK),
      url: (node as any).url,
      children: remarkTransformElementChildren(
        node,
        0,
        options,
        inheritedMarkProps
      ),
    } as TElement
  }

  const textRule = (textRules as any)[type!] || remarkDefaultTextRules.text

  const { mark, transform = (text: string) => text } = textRule

  const markProps = mark
    ? {
        ...inheritedMarkProps,
        [mark({ editor })]: true,
      }
    : inheritedMarkProps

  const childNodes =
    children?.flatMap((child) =>
      remarkTransformText(child, options, markProps)
    ) || []

  const currentTextNodes =
    value || childNodes.length === 0
      ? [{ text: transform(value || ''), ...markProps } as TText]
      : []

  const allNodes = [...currentTextNodes, ...childNodes].flat()

  // If we only have one node, return it directly
  if (allNodes.length === 1) {
    return allNodes[0]
  }

  return allNodes
}
