import { Box, BoxProps } from '@chakra-ui/react'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { useEffect, useRef } from 'react'

type Props = {
  value: string
  lang: 'css' | 'json'
  onChange?: (value: string) => void
  isReadOnly?: boolean
}
export const CodeEditor = ({
  value,
  lang,
  onChange,
  isReadOnly = false,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const editorView = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorView.current || !isReadOnly) return
    editorView.current.dispatch({
      changes: { from: 0, insert: value },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (!editorContainer.current) return
    const updateListenerExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange)
        onChange(update.state.doc.toJSON().join(' '))
    })
    const extensions = [
      updateListenerExtension,
      basicSetup,
      EditorState.readOnly.of(isReadOnly),
    ]
    extensions.push(lang === 'json' ? json() : css())
    const editor = new EditorView({
      state: EditorState.create({
        extensions,
      }),
      parent: editorContainer.current,
    })
    editor.dispatch({
      changes: { from: 0, insert: value },
    })
    editorView.current = editor
    return () => {
      editor.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box ref={editorContainer} h="200px" data-testid="code-editor" {...props} />
  )
}
