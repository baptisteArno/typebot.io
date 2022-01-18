import { Link } from '@chakra-ui/react'
import {
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

export const platePlugins = createPlugins(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createLinkPlugin(),
  ],
  { components: { [ELEMENT_LINK]: Link } }
)
