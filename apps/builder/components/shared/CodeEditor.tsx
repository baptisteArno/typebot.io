import { Box, BoxProps } from '@chakra-ui/react'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { linter } from '@codemirror/lint'

const linterExtension = linter(jsonParseLinter())

type Props = {
  value: string
  lang?: 'css' | 'json' | 'js' | 'html'
  isReadOnly?: boolean
  debounceTimeout?: number
  onChange?: (value: string) => void
}
export const CodeEditor = ({
  value,
  lang,
  onChange,
  isReadOnly = false,
  debounceTimeout = 1000,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const editorView = useRef<EditorView | null>(null)
  const [, setPlainTextValue] = useState(value)
  const debounced = useDebouncedCallback(
    (value) => {
      setPlainTextValue(value)
      onChange && onChange(value)
    },
    process.env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout
  )

  useEffect(
    () => () => {
      debounced.flush()
    },
    [debounced]
  )

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
        debounced(update.state.doc.toJSON().join('\n'))
    })
    const extensions = [
      updateListenerExtension,
      basicSetup,
      EditorState.readOnly.of(isReadOnly),
    ]
    if (lang === 'json') {
      extensions.push(json())
      extensions.push(linterExtension)
    }
    if (lang === 'css') extensions.push(css())
    if (lang === 'js') extensions.push(javascript())
    if (lang === 'html') extensions.push(html())
    extensions.push(
      EditorView.theme({
        '&': { maxHeight: '500px' },
        '.cm-gutter,.cm-content': { minHeight: isReadOnly ? '0' : '250px' },
        '.cm-scroller': { overflow: 'auto' },
      })
    )
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

  return <Box ref={editorContainer} data-testid="code-editor" {...props} />
}
