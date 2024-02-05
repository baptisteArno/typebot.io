import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common'
import markdown from 'remark-parse'
import { unified } from 'unified'

import { DeserializeMdPlugin } from './types'
import { remarkPlugin } from '../remark-slate/remarkPlugin'
import { RemarkPluginOptions } from '../remark-slate/types'
import { KEY_DESERIALIZE_MD } from '../convertMarkdownToRichText'

export const deserialize = <V extends Value>(
  editor: PlateEditor<V>,
  data: string
) => {
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
    .processSync(data)

  return tree.result
}
