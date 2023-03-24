import { Flex, Stack, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Plate, PlateProvider, usePlateEditorRef } from '@udecode/plate-core'
import { editorStyle, platePlugins } from '@/lib/plate'
import { BaseEditor, BaseSelection, Transforms } from 'slate'
import {
  defaultTextBubbleContent,
  TextBubbleContent,
  Variable,
} from '@typebot.io/schemas'
import { ReactEditor } from 'slate-react'
import { serializeHtml } from '@udecode/plate-serializer-html'
import { parseHtmlStringToPlainText } from '../utils'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { colors } from '@/lib/theme'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { selectEditor, TElement } from '@udecode/plate-common'
import { TextEditorToolBar } from './TextEditorToolBar'

type TextBubbleEditorContentProps = {
  id: string
  textEditorValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
}

const TextBubbleEditorContent = ({
  id,
  textEditorValue,
  onClose,
}: TextBubbleEditorContentProps) => {
  const variableInputBg = useColorModeValue('white', 'gray.900')
  const editor = usePlateEditorRef()
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<BaseSelection | null>(null)
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const [isFirstFocus, setIsFirstFocus] = useState(true)

  const textEditorRef = useRef<HTMLDivElement>(null)

  const closeEditor = () => onClose(convertValueToBlockContent(textEditorValue))

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  })

  useEffect(() => {
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

  const convertValueToBlockContent = (value: TElement[]): TextBubbleContent => {
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

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!rememberedSelection.current || !variable) return
    ReactEditor.focus(editor as unknown as ReactEditor)
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, '{{' + variable.name + '}}')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      pos="relative"
      spacing={0}
      cursor="text"
      className="prevent-group-drag"
      sx={{
        '.slate-ToolbarButton-active': {
          color: useColorModeValue('blue.500', 'blue.300') + ' !important',
        },
        '.PlateFloatingLink___StyledFloatingLinkInsertRoot-sc-1bralnd-8': {
          backgroundColor: useColorModeValue('white', 'gray.800'),
          borderWidth: 1,
        },
        '.PlateFloatingLink___StyledDiv2-sc-1bralnd-2': {
          backgroundColor: useColorModeValue('gray.200', 'gray.600'),
        },
        '.slate-a': {
          color: useColorModeValue('blue.500', 'blue.300'),
        },
      }}
    >
      <TextEditorToolBar
        onVariablesButtonClick={() => setIsVariableDropdownOpen(true)}
      />
      <Plate
        id={id}
        editableProps={{
          style: editorStyle(useColorModeValue('white', colors.gray[850])),
          autoFocus: true,
          onFocus: () => {
            if (!isFirstFocus) return
            if (editor.children.length === 0) return
            selectEditor(editor, {
              edge: 'end',
            })
            setIsFirstFocus(false)
          },
          'aria-label': 'Text editor',
          onBlur: () => {
            rememberedSelection.current = editor?.selection
          },
          onKeyDown: handleKeyDown,
          onClick: () => {
            setIsVariableDropdownOpen(false)
          },
        }}
      />
      {isVariableDropdownOpen && (
        <Flex
          pos="absolute"
          ref={varDropdownRef}
          shadow="lg"
          rounded="md"
          bg={variableInputBg}
          w="250px"
          zIndex={10}
        >
          <VariableSearchInput
            initialVariableId={undefined}
            onSelectVariable={handleVariableSelected}
            placeholder="Search for a variable"
            autoFocus
          />
        </Flex>
      )}
    </Stack>
  )
}

type TextBubbleEditorProps = {
  id: string
  initialValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
}

export const TextBubbleEditor = ({
  id,
  initialValue,
  onClose,
}: TextBubbleEditorProps) => {
  const [textEditorValue, setTextEditorValue] = useState(initialValue)

  return (
    <PlateProvider
      id={id}
      plugins={platePlugins}
      initialValue={
        initialValue.length === 0
          ? [{ type: 'p', children: [{ text: '' }] }]
          : initialValue
      }
      onChange={setTextEditorValue}
    >
      <TextBubbleEditorContent
        id={id}
        textEditorValue={textEditorValue}
        onClose={onClose}
      />
    </PlateProvider>
  )
}
