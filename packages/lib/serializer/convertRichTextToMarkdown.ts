import { TElement } from '@udecode/plate-common'
import serialize from './serialize'
import { defaultNodeTypes } from './ast-types'

export const convertRichTextToMarkdown = (
  richText: TElement[],
  options?: { flavour?: 'common' | 'whatsapp' }
) => {
  let extraNewLinesCount = 0
  const test = richText
    .reduce<string[]>((acc, node) => {
      if (node.type === 'variable') {
        return [
          ...acc,
          ...node.children.map(
            (child) =>
              serialize(child, {
                nodeTypes: defaultNodeTypes,
                flavour: options?.flavour,
              }) as string
          ),
        ]
      }
      const serializedElement = serialize(node, {
        nodeTypes: defaultNodeTypes,
        flavour: options?.flavour,
      })
      if (!serializedElement || serializedElement === '<br>\n\n') {
        if (extraNewLinesCount > 0) {
          return [...acc, '']
        }
        extraNewLinesCount++
        return acc
      }
      extraNewLinesCount = 0
      return [...acc, serializedElement]
    }, [])
    .join('\n')

  return test.endsWith('\n') ? test.slice(0, -1) : test
}
