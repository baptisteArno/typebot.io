import { parseVideoUrl } from '@typebot.io/lib/parseVideoUrl'
import {
  BubbleBlock,
  Variable,
  ContinueChatResponse,
  Typebot,
} from '@typebot.io/schemas'
import { deepParseVariables } from './variables/deepParseVariables'
import { isEmpty, isNotEmpty } from '@typebot.io/lib/utils'
import {
  getVariablesToParseInfoInText,
  parseVariables,
} from './variables/parseVariables'
import { TDescendant, createPlateEditor } from '@udecode/plate-common'
import {
  createDeserializeMdPlugin,
  deserializeMd,
} from '@udecode/plate-serializer-md'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { defaultVideoBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'

type Params = {
  version: 1 | 2
  typebotVersion: Typebot['version']
  variables: Variable[]
}

export type BubbleBlockWithDefinedContent = BubbleBlock & {
  content: NonNullable<BubbleBlock['content']>
}

export const parseBubbleBlock = (
  block: BubbleBlockWithDefinedContent,
  { version, variables, typebotVersion }: Params
): ContinueChatResponse['messages'][0] => {
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      if (version === 1)
        return {
          ...block,
          content: {
            ...block.content,
            richText: (block.content?.richText ?? []).map(
              deepParseVariables(variables)
            ),
          },
        }
      return {
        ...block,
        content: {
          ...block.content,
          richText: parseVariablesInRichText(block.content?.richText ?? [], {
            variables,
            takeLatestIfList: typebotVersion !== '6',
          }),
        },
      }
    }

    case BubbleBlockType.EMBED: {
      const message = deepParseVariables(variables)(block)
      return {
        ...message,
        content: {
          ...message.content,
          height:
            typeof message.content?.height === 'string'
              ? parseFloat(message.content.height)
              : message.content?.height,
        },
      }
    }
    case BubbleBlockType.VIDEO: {
      const parsedContent = block.content
        ? deepParseVariables(variables)(block.content)
        : undefined

      return {
        ...block,
        content: {
          ...parsedContent,
          ...(parsedContent?.url ? parseVideoUrl(parsedContent.url) : {}),
          height:
            typeof parsedContent?.height === 'string'
              ? parseFloat(parsedContent.height)
              : defaultVideoBubbleContent.height,
        },
      }
    }
    default:
      return deepParseVariables(variables)(block)
  }
}

const parseVariablesInRichText = (
  elements: TDescendant[],
  {
    variables,
    takeLatestIfList,
  }: { variables: Variable[]; takeLatestIfList?: boolean }
): TDescendant[] => {
  const parsedElements: TDescendant[] = []
  for (const element of elements) {
    if ('text' in element) {
      const text = element.text as string
      if (isEmpty(text)) {
        parsedElements.push(element)
        continue
      }
      const variablesInText = getVariablesToParseInfoInText(text, {
        variables,
        takeLatestIfList,
      })
      if (variablesInText.length === 0) {
        parsedElements.push(element)
        continue
      }
      let lastTextEndIndex = 0
      let index = -1
      for (const variableInText of variablesInText) {
        index += 1
        const textBeforeVariable = text.substring(
          lastTextEndIndex,
          variableInText.startIndex
        )
        const textAfterVariable =
          index === variablesInText.length - 1
            ? text.substring(variableInText.endIndex)
            : undefined
        lastTextEndIndex = variableInText.endIndex
        const isStandaloneElement =
          isEmpty(textBeforeVariable) && isEmpty(textAfterVariable)
        const variableElements = convertMarkdownToRichText(
          isStandaloneElement
            ? variableInText.value
            : variableInText.value.replace(/[\n]+/g, ' ')
        )
        const variableElementsWithStyling = applyElementStyleToDescendants(
          variableElements,
          {
            bold: element.bold,
            italic: element.italic,
            underline: element.underline,
          }
        )

        if (isStandaloneElement) {
          parsedElements.push(...variableElementsWithStyling)
          continue
        }
        const children: TDescendant[] = []
        if (isNotEmpty(textBeforeVariable))
          children.push({
            ...element,
            text: textBeforeVariable,
          })
        children.push({
          type: 'inline-variable',
          children: variableElementsWithStyling,
        })
        if (isNotEmpty(textAfterVariable))
          children.push({
            ...element,
            text: textAfterVariable,
          })
        parsedElements.push(...children)
      }

      continue
    }

    const type =
      element.children.length === 1 &&
      'text' in element.children[0] &&
      (element.children[0].text as string).startsWith('{{') &&
      (element.children[0].text as string).endsWith('}}') &&
      element.type !== 'a'
        ? 'variable'
        : element.type

    parsedElements.push({
      ...element,
      url: element.url
        ? parseVariables(variables)(element.url as string)
        : undefined,
      type,
      children: parseVariablesInRichText(element.children as TDescendant[], {
        variables,
        takeLatestIfList,
      }),
    })
  }
  return parsedElements
}

const applyElementStyleToDescendants = (
  variableElements: TDescendant[],
  styles: { bold: unknown; italic: unknown; underline: unknown }
): TDescendant[] =>
  variableElements.map((variableElement) => {
    if ('text' in variableElement) return { ...styles, ...variableElement }
    return {
      ...variableElement,
      children: applyElementStyleToDescendants(
        variableElement.children,
        styles
      ),
    }
  })

const convertMarkdownToRichText = (text: string): TDescendant[] => {
  const plugins = [createDeserializeMdPlugin()]
  return deserializeMd(createPlateEditor({ plugins }) as unknown as any, text)
}
