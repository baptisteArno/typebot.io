import { Link } from '@chakra-ui/react'
import {
  AutoformatRule,
  createAutoformatPlugin,
} from '@udecode/plate-autoformat'
import {
  MARK_BOLD,
  MARK_UNDERLINE,
  MARK_ITALIC,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks'
import { createPlugins } from '@udecode/plate-core'
import { createLinkPlugin, ELEMENT_LINK } from '@udecode/plate-link'

export const editorStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '0.25rem',
}

export const autoFormatRules: AutoformatRule[] = [
  {
    mode: 'mark',
    type: MARK_BOLD,
    match: '**',
  },
  {
    mode: 'mark',
    type: MARK_UNDERLINE,
    match: '__',
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '*',
  },
  {
    mode: 'mark',
    type: MARK_ITALIC,
    match: '_',
  },
]

export const platePlugins = createPlugins(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createLinkPlugin(),
    createAutoformatPlugin({
      options: {
        rules: autoFormatRules,
      },
    }),
  ],
  { components: { [ELEMENT_LINK]: Link } }
)
