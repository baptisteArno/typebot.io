import { Flex, Stack, useOutsideClick } from '@chakra-ui/react'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { ToolBar } from './ToolBar'
import { parseHtmlStringToPlainText } from 'services/utils'
import { defaultTextBubbleContent, TextBubbleContent, Variable } from 'models'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ReactEditor } from 'slate-react'

type Props = {
  initialValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
  onKeyUp?: (newContent: TextBubbleContent) => void
  increment?: number
}

export const TextBubbleEditor = ({ initialValue, onClose, onKeyUp, increment }: Props) => {
  const randomEditorId = useMemo(() => Math.random().toString(), [])
  const editor = useMemo(
    () =>
      withPlate(createEditor() as TEditor<Value>, {
        id: `${randomEditorId}${increment ? `-${increment}` : ''}`,
        plugins: platePlugins,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const [value, setValue] = useState(initialValue)
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<BaseSelection | null>(null)
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)

  const textEditorRef = useRef<HTMLDivElement>(null)
  let timeoutId: number

  const closeEditor = () => {
    if (onClose) onClose(convertValueToStepContent(value))
  }
  const keyUpEditor = () => {
    if (onKeyUp) onKeyUp(convertValueToStepContent(value))
  }

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  })

  useLayoutEffect(() => {
    if (!isVariableDropdownOpen) return
    const el = varDropdownRef.current
    if (!el) return
    const { top, left } = computeTargetCoord()
    el.style.top = `${top}px`
    el.style.left = `${left}px`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVariableDropdownOpen])

  const computeTargetCoord = () => {
    const selection = window.getSelection()
    const relativeParent = textEditorRef.current
    
    if (!selection || !relativeParent) return { top: 0, left: 0 }

    const range = selection.getRangeAt(0)
    const selectionBoundingRect = range.getBoundingClientRect()
    const relativeRect = relativeParent.getBoundingClientRect()
    return {
      top: selectionBoundingRect.bottom - relativeRect.top,
      left: selectionBoundingRect.left - relativeRect.left,
    }
  }

  const convertValueToStepContent = (value: TElement[]): TextBubbleContent => {
    if (value.length === 0) defaultTextBubbleContent
    const html = serializeHtml(editor, {
      nodes: value,
    })
    return {
      html,
      richText: value,
      plainText: parseHtmlStringToPlainText(html),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!rememberedSelection.current || !variable) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, '{{' + variable.token + '}}')
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleChangeEditorContent = (val: TElement[]) => {
    setValue(val)
    setIsVariableDropdownOpen(false)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return
    if (e.key === 'Enter') closeEditor()
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(keyUpEditor, 1500) as unknown as number
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
        onVariablesButtonClick={() => setIsVariableDropdownOpen(true)}
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
          onKeyUp: handleKeyUp
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
          w="320px"
          zIndex={10}
        >
          <VariableSearchInput
            onSelectVariable={handleVariableSelected}
            placeholder="Pesquise sua variável"
            handleOutsideClick={() => {
              console.log('Saiuaaaaa')
              setIsVariableDropdownOpen(false)
            }}
          />
        </Flex>
      )}
    </Stack>
  )
}
