import {
  createPlateEditor,
  createPluginFactory,
  getPluginOptions,
  isUrl,
  Value,
} from '@udecode/plate-common'
import markdown from 'remark-parse'
import { unified } from 'unified'

import { DeserializeMdPlugin } from './deserializer/types'
import { remarkPlugin } from './remark-slate/remarkPlugin'
import { RemarkPluginOptions } from './remark-slate/types'
import { remarkDefaultElementRules } from './remark-slate/remarkDefaultElementRules'
import { remarkDefaultTextRules } from './remark-slate/remarkDefaultTextRules'
import { deserialize } from './deserializer/deserialize'

export const convertMarkdownToRichText = <V extends Value>(
  data: string,
  variableKey?: string
) => {
  const plugins = [createDeserializeMdPlugin()]
  const editor = createPlateEditor({ plugins }) as unknown as any
  const { elementRules, textRules, indentList } = getPluginOptions<
    DeserializeMdPlugin,
    V
  >(editor, KEY_DESERIALIZE_MD)

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      textRules,
      indentList,
    } as unknown as RemarkPluginOptions<V>)
    // Unset variables get ignored. To better save variables across sessions,
    // set them to a custom value "UNSET_VARIABLE" that can processed in AVC-Typebot Service.
    .processSync(data || 'UNSET_VARIABLE')

  if (variableKey && Array.isArray(tree.result)) {
    tree.result.forEach((res: any) => {
      if (Array.isArray(res.children)) {
        res.children = res.children.map((child: any) =>
          child.text === tree.value ? { ...child, variableKey } : child
        )
      }
    })
  }

  return tree.result
}

export const KEY_DESERIALIZE_MD = 'deserializeMd'

const createDeserializeMdPlugin = createPluginFactory<DeserializeMdPlugin>({
  key: KEY_DESERIALIZE_MD,
  then: (editor) => ({
    editor: {
      insertData: {
        format: 'text/plain',
        query: ({ data, dataTransfer }) => {
          const htmlData = dataTransfer.getData('text/html')
          if (htmlData) return false

          const { files } = dataTransfer
          if (
            !files?.length && // if content is simply a URL pass through to not break LinkPlugin
            isUrl(data)
          ) {
            return false
          }
          return true
        },
        getFragment: ({ data }) => deserialize<Value>(editor, data),
      },
    },
  }),
  options: {
    elementRules: remarkDefaultElementRules,
    textRules: remarkDefaultTextRules,
    indentList: false,
  },
})
