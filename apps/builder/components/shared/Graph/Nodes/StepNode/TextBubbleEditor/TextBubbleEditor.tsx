import React, { useMemo, useRef, useState } from 'react'
import { Flex, Stack, useOutsideClick } from '@chakra-ui/react'
import {
  Plate,
  selectEditor,
  serializeHtml,
  TEditor,
  TElement,
  Value,
  withPlate,
} from '@udecode/plate-core'
import { editorStyle, platePlugins } from 'libs/plate'
import { BaseEditor, BaseSelection, createEditor, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { defaultTextBubbleContent, TextBubbleContent, Variable } from 'models'
import { parseHtmlStringToPlainText } from 'services/utils'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ToolBar } from './ToolBar'

type TextBubbleEditorProps = {
  initialValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
  onKeyUp?: (newContent: TextBubbleContent) => void
  increment?: number
}

export const TextBubbleEditor = ({
  initialValue,
  onClose,
  onKeyUp,
  increment,
}: TextBubbleEditorProps) => {
  const [value, setValue] = useState(initialValue)
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<BaseSelection | null>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)

  const randomEditorId = useMemo(
    () => `${Math.random().toString()}${increment ? `-${increment}` : ''}`,
    [increment]
  )

  const editor = useMemo(
    () =>
      withPlate(createEditor() as TEditor<Value>, {
        id: randomEditorId,
        plugins: platePlugins,
      }),
    [randomEditorId]
  )

  const closeEditor = () => {
    if (onClose) onClose(convertValueToStepContent(value))
  }

  const keyUpEditor = (v?: TElement[]) => {
    if (onKeyUp) onKeyUp(convertValueToStepContent(v || value))
  }

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  })

  const convertValueToStepContent = (v: TElement[]): TextBubbleContent => {
    if (v.length === 0) defaultTextBubbleContent
    const html = serializeHtml(editor, {
      nodes: v,
    }).replace(/<[^/>]*>\s*<\/[^>]*>/g, '')

    return {
      html,
      richText: v,
      plainText: parseHtmlStringToPlainText(html),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEmoji = (emoji?: string) => {
    if (!rememberedSelection.current || !emoji) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, emoji)
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!rememberedSelection.current || !variable) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, '{{' + variable.token + '}}')
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleChangeEditorContent = (val: TElement[]) => {
    const timeout = setTimeout(() => {
      if (timeout) clearTimeout(timeout)
      setValue(val)
      keyUpEditor(val)
    }, 250)

    setIsVariableDropdownOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return
    if (e.key === 'Enter') closeEditor()
  }

  return (
    <Stack
      flex="1"
      ref={textEditorRef}
      borderWidth="2px"
      borderColor="blue.400"
      rounded="md"
      onMouseDown={handleMouseDown}
      pos="relative"
      spacing={0}
      cursor="text"
    >
      <ToolBar
        editor={editor}
        onVariablesButtonClick={(showDialog) => {
          setIsVariableDropdownOpen(showDialog)
        }}
        onEmojiSelected={handleEmoji}
      />
      <Plate
        id={randomEditorId}
        editableProps={{
          style: editorStyle,
          autoFocus: true,
          onFocus: () => {
            if (editor.children.length === 0) return
            selectEditor(editor, {
              edge: 'end',
            })
          },
          'aria-label': 'Text editor',
          onBlur: () => {
            rememberedSelection.current = editor.selection
          },
          onKeyDown: handleKeyDown,
          onKeyUp: () => keyUpEditor(),
        }}
        initialValue={
          initialValue.length === 0
            ? [{ type: 'p', children: [{ text: '' }] }]
            : initialValue
        }
        onChange={handleChangeEditorContent}
        editor={editor}
      />
      {isVariableDropdownOpen && (
        <Flex
          pos="absolute"
          ref={varDropdownRef}
          shadow="lg"
          rounded="md"
          bgColor="white"
          w="100%"
          zIndex={10}
        >
          <VariableSearchInput
            onSelectVariable={handleVariableSelected}
            placeholder="Pesquise sua variável"
            handleOutsideClick={() => setIsVariableDropdownOpen(false)}
            isSaveContext={false}
            labelDefault={'Selecione uma variável:'}
          />
        </Flex>
      )}
    </Stack>
  )
}
