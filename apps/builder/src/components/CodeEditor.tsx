import {
  Box,
  BoxProps,
  HStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { linter, LintSource } from '@codemirror/lint'
import { VariablesButton } from '@/features/variables'
import { Variable } from 'models'
import { env } from 'utils'
import { espresso, dracula } from 'thememirror'

const linterExtension = linter(jsonParseLinter() as unknown as LintSource)

type Props = {
  value: string
  lang?: 'css' | 'json' | 'js' | 'html'
  isReadOnly?: boolean
  debounceTimeout?: number
  withVariableButton?: boolean
  height?: string
  onChange?: (value: string) => void
}
export const CodeEditor = ({
  value,
  lang,
  onChange,
  height = '250px',
  withVariableButton = true,
  isReadOnly = false,
  debounceTimeout = 1000,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const isDark = useColorMode().colorMode === 'dark'
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const editorView = useRef<EditorView | null>(null)
  const [, setPlainTextValue] = useState(value)
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const isVariableButtonDisplayed = withVariableButton && !isReadOnly

  const debounced = useDebouncedCallback(
    (value) => {
      setPlainTextValue(value)
      onChange && onChange(value)
    },
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
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
      isDark ? dracula : espresso,
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
        '.cm-gutter,.cm-content': { minHeight: isReadOnly ? '0' : height },
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

  const handleVariableSelected = (variable?: Pick<Variable, 'id' | 'name'>) => {
    editorView.current?.focus()
    const insert = `{{${variable?.name}}}`
    editorView.current?.dispatch({
      changes: {
        from: carretPosition,
        insert,
      },
      selection: { anchor: carretPosition + insert.length },
    })
  }

  const handleKeyUp = () => {
    if (!editorContainer.current) return
    setCarretPosition(editorView.current?.state.selection.main.from ?? 0)
  }

  return (
    <HStack
      align="flex-end"
      spacing={0}
      borderWidth={'1px'}
      borderRadius="md"
      bg={useColorModeValue('#FCFCFC', '#2D2F3F')}
    >
      <Box
        w={isVariableButtonDisplayed ? 'calc(100% - 32px)' : '100%'}
        ref={editorContainer}
        data-testid="code-editor"
        {...props}
        onKeyUp={handleKeyUp}
      />
      {isVariableButtonDisplayed && (
        <VariablesButton onSelectVariable={handleVariableSelected} size="sm" />
      )}
    </HStack>
  )
}
