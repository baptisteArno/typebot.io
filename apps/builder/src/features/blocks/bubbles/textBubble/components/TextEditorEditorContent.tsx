import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { editorStyle } from '@/lib/plate'
import { colors } from '@/lib/theme'
import {
  useColorModeValue,
  Popover,
  PopoverAnchor,
  Flex,
  Portal,
  PopoverContent,
  Stack,
} from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextEditorToolBar } from './TextEditorToolBar'
import { useTranslate } from '@tolgee/react'
import { PlateContent, useEditorRef } from '@udecode/plate-core'
import { focusEditor, insertText, selectEditor } from '@udecode/plate-common'
import { useOutsideClick } from '@/hooks/useOutsideClick'

type Props = {
  closeEditor: () => void
}
export const TextEditorEditorContent = ({ closeEditor }: Props) => {
  const { t } = useTranslate()
  const editor = useEditorRef()
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const [isFirstFocus, setIsFirstFocus] = useState(true)

  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<typeof editor.selection | null>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)
  const plateContentRef = useRef<HTMLDivElement>(null)

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!variable) return
    focusEditor(editor)
    insertText(editor, '{{' + variable.name + '}}')
  }

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) closeEditor()
  }

  const computeTargetCoord = useCallback(() => {
    if (rememberedSelection.current) return { top: 0, left: 0 }
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
  }, [])

  useEffect(() => {
    if (!isVariableDropdownOpen) return
    const el = varDropdownRef.current
    if (!el) return
    const { top, left } = computeTargetCoord()
    if (top === 0 && left === 0) return
    el.style.top = `${top}px`
    el.style.left = `${left}px`
  }, [computeTargetCoord, isVariableDropdownOpen])

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
      onContextMenuCapture={(e) => e.stopPropagation()}
      sx={{
        '.slate-ToolbarButton-active': {
          color: useColorModeValue('blue.500', 'blue.300') + ' !important',
        },
        '[class^="PlateFloatingLink___Styled"]': {
          '--tw-bg-opacity': useColorModeValue('1', '.1') + '!important',
          backgroundColor: useColorModeValue('white', 'gray.800'),
          borderRadius: 'md',
          transitionProperty: 'background-color',
          transitionDuration: 'normal',
        },
        '[class^="FloatingVerticalDivider___"]': {
          '--tw-bg-opacity': useColorModeValue('1', '.4') + '!important',
        },
        '.slate-a': {
          color: useColorModeValue('blue.500', 'blue.300'),
        },
      }}
    >
      <TextEditorToolBar
        onVariablesButtonClick={() => setIsVariableDropdownOpen(true)}
      />
      <PlateContent
        ref={plateContentRef}
        onKeyDown={handleKeyDown}
        style={editorStyle(useColorModeValue('white', colors.gray[850]))}
        autoFocus
        onClick={() => {
          setIsVariableDropdownOpen(false)
        }}
        onFocus={() => {
          rememberedSelection.current = null
          if (!isFirstFocus || !editor) return
          if (editor.children.length === 0) return
          selectEditor(editor, {
            edge: 'end',
          })
          setIsFirstFocus(false)
        }}
        onBlur={() => {
          if (!editor) return
          rememberedSelection.current = editor.selection
        }}
        aria-label="Text editor"
      />
      <Popover isOpen={isVariableDropdownOpen} isLazy>
        <PopoverAnchor>
          <Flex pos="absolute" ref={varDropdownRef} />
        </PopoverAnchor>
        <Portal>
          <PopoverContent>
            <VariableSearchInput
              initialVariableId={undefined}
              onSelectVariable={handleVariableSelected}
              placeholder={t(
                'editor.blocks.bubbles.textEditor.searchVariable.placeholder'
              )}
              autoFocus
            />
          </PopoverContent>
        </Portal>
      </Popover>
    </Stack>
  )
}
