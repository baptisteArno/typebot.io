import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks'
import { createPlugins } from '@udecode/plate-core'

export const editorStyle = (backgroundColor: string): React.CSSProperties => ({
  flex: 1,
  padding: '1rem',
  backgroundColor,
  borderRadius: '0.25rem',
  outline: 'none',
})

export const platePlugins = createPlugins([
  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
])
