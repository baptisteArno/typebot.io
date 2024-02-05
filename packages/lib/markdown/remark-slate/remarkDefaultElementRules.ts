import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote'
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block'
import {
  getPluginType,
  TDescendant,
  TElement,
  TText,
  Value,
} from '@udecode/plate-common'
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading'
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule'
import { ELEMENT_LINK } from '@udecode/plate-link'
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@udecode/plate-list'
import { ELEMENT_IMAGE } from '@udecode/plate-media'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'

import { remarkTransformElementChildren } from './remarkTransformElementChildren'
import { MdastNode, RemarkElementRules, RemarkPluginOptions } from './types'

export const remarkDefaultElementRules: RemarkElementRules<Value> = {
  heading: {
    transform: (node, lastLineNumber, options) => {
      const headingType = {
        1: ELEMENT_H1,
        2: ELEMENT_H2,
        3: ELEMENT_H3,
        4: ELEMENT_H4,
        5: ELEMENT_H5,
        6: ELEMENT_H6,
      }[node.depth ?? 1]

      return [
        ...parseLineBreakNodes(node, lastLineNumber, options),
        {
          type: getPluginType(options.editor, headingType),
          children: remarkTransformElementChildren(
            node,
            node.position.end.line,
            options
          ),
        },
      ]
    },
  },
  list: {
    transform: (node, lastLineNumber, options) => {
      if (options.indentList) {
        const listStyleType = node.ordered ? 'decimal' : 'disc'

        const parseListItems = (
          _node: MdastNode,
          listItems: TElement[] = [],
          indent = 1
        ) => {
          _node.children!.forEach((listItem) => {
            const [paragraph, ...subLists] = listItem.children!

            listItems.push({
              type: getPluginType(options.editor, ELEMENT_PARAGRAPH),
              listStyleType,
              indent,
              children: remarkTransformElementChildren(
                paragraph || '',
                node.position.end.line,
                options
              ),
            })

            subLists.forEach((subList) => {
              parseListItems(subList, listItems, indent + 1)
            })
          })

          return listItems
        }

        return [
          ...parseLineBreakNodes(node, lastLineNumber, options),
          parseListItems(node),
        ]
      } else {
        return [
          ...parseLineBreakNodes(node, lastLineNumber, options),
          {
            type: getPluginType(
              options.editor,
              node.ordered ? ELEMENT_OL : ELEMENT_UL
            ),
            children: remarkTransformElementChildren(
              node,
              node.position.end.line,
              options
            ),
          },
        ]
      }
    },
  },
  listItem: {
    transform: (node, _lastLineNumber, options) => {
      return {
        type: getPluginType(options.editor, ELEMENT_LI),
        children: remarkTransformElementChildren(
          node,
          node.position.end.line,
          options
        ).map(
          (child) =>
            ({
              ...child,
              type:
                child.type === getPluginType(options.editor, ELEMENT_PARAGRAPH)
                  ? getPluginType(options.editor, ELEMENT_LIC)
                  : child.type,
            } as TDescendant)
        ),
      }
    },
  },
  paragraph: {
    transform: (node, lastLineNumber, options) => {
      const children = remarkTransformElementChildren(
        node,
        node.position.end.line,
        options
      )

      const paragraphType = getPluginType(options.editor, ELEMENT_PARAGRAPH)
      const splitBlockTypes = new Set([
        getPluginType(options.editor, ELEMENT_IMAGE),
      ])

      const elements: TElement[] = []
      let inlineNodes: TDescendant[] = []

      const flushInlineNodes = () => {
        if (inlineNodes.length > 0) {
          elements.push({
            type: paragraphType,
            children: inlineNodes,
          })

          inlineNodes = []
        }
      }

      children.forEach((child) => {
        const { type } = child

        if (type && splitBlockTypes.has(type as string)) {
          flushInlineNodes()
          elements.push(child as TElement)
        } else {
          inlineNodes.push(child)
        }
      })

      flushInlineNodes()

      return [
        ...parseLineBreakNodes(node, lastLineNumber, options),
        ...elements,
      ]
    },
  },
  link: {
    transform: (node, lastLineNumber, options) => [
      ...parseLineBreakNodes(node, lastLineNumber, options),
      {
        type: getPluginType(options.editor, ELEMENT_LINK),
        url: node.url,
        children: remarkTransformElementChildren(
          node,
          node.position.end.line,
          options
        ),
      },
    ],
  },
  image: {
    transform: (node, lastLineNumber, options) => [
      ...parseLineBreakNodes(node, lastLineNumber, options),
      {
        type: getPluginType(options.editor, ELEMENT_IMAGE),
        children: [{ text: '' } as TText],
        url: node.url,
        caption: [{ text: node.alt } as TText],
      },
    ],
  },
  blockquote: {
    transform: (node, lastLineNumber, options) => [
      ...parseLineBreakNodes(node, lastLineNumber, options),
      {
        type: getPluginType(options.editor, ELEMENT_BLOCKQUOTE),
        children: node.children!.flatMap((paragraph) =>
          remarkTransformElementChildren(
            paragraph,
            node.position.end.line,
            options
          )
        ),
      },
    ],
  },
  code: {
    transform: (node, lastLineNumber, options) => [
      ...parseLineBreakNodes(node, lastLineNumber, options),
      {
        type: getPluginType(options.editor, ELEMENT_CODE_BLOCK),
        lang: node.lang ?? undefined,
        children: (node.value || '').split('\n').map((line) => ({
          type: getPluginType(options.editor, ELEMENT_CODE_LINE),
          children: [{ text: line } as TText],
        })),
      },
    ],
  },
  thematicBreak: {
    transform: (node, lastLineNumber, options) => [
      ...parseLineBreakNodes(node, lastLineNumber, options),
      {
        type: getPluginType(options.editor, ELEMENT_HR),
        children: [{ text: '' } as TText],
      },
    ],
  },
}

const parseLineBreakNodes = (
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<Value>
) => {
  const lineBreaks = node.position.start.line - lastLineNumber

  let lineBreakNodes = []

  if (lineBreaks > 1)
    lineBreakNodes.push(
      ...Array(lineBreaks - 1).fill({
        type: getPluginType(options.editor, ELEMENT_PARAGRAPH),
        children: [{ text: '' } as TText],
      })
    )

  return lineBreakNodes
}
