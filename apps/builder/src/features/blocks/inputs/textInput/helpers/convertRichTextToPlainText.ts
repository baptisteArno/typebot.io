import { TElement } from '@udecode/plate-common'

type TextNode = { text: string }

const isTextNode = (node: TElement | TextNode): node is TextNode =>
  typeof (node as TextNode).text === 'string'

export const convertRichTextToPlainText = (elements: TElement[]): string =>
  elements.map(extractNodeText).join('\n')

const extractNodeText = (node: TElement | TextNode): string => {
  if (isTextNode(node)) return node.text
  return (node.children as (TElement | TextNode)[])
    .map(extractNodeText)
    .join('')
}
