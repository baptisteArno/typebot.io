import { Box, BoxProps } from '@chakra-ui/react'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  lang?: 'css' | 'json' | 'js' | 'html'
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
  const [plainTextValue, setPlainTextValue] = useState(value)

  useEffect(() => {
    if (!editorView.current || !isReadOnly) return
    editorView.current.dispatch({
      changes: {
        from: 0,
        to: editorView.current.state.doc.length,
        insert: value,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (!onChange || plainTextValue === value) return
    onChange(plainTextValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainTextValue])

  useEffect(() => {
    const editor = initEditor(value)
    return () => {
      editor?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initEditor = (value: string) => {
    if (!editorContainer.current) return
    const updateListenerExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange)
        setPlainTextValue(update.state.doc.toJSON().join('\n'))
    })
    const extensions = [
      updateListenerExtension,
      basicSetup,
      EditorState.readOnly.of(isReadOnly),
    ]
    if (lang === 'json') extensions.push(json())
    if (lang === 'css') extensions.push(css())
    if (lang === 'js') extensions.push(javascript())
    if (lang === 'html') extensions.push(html())
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
    return editor
  }

  return (
    <Box
      ref={editorContainer}
      data-testid="code-editor"
      h={isReadOnly ? 'auto' : '250px'}
      {...props}
    />
  )
}
