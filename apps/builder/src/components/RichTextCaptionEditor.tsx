import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  UserIcon,
} from '@/components/icons'
import { editorStyle, platePlugins } from '@/lib/plate'
import { colors } from '@/lib/theme'
import {
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import {
  Plate,
  PlateContent,
  getPluginType,
  useEditorRef,
} from '@udecode/plate-core'
import { focusEditor, insertText, TElement } from '@udecode/plate-common'
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks'
import { MarkToolbarButton } from '@/features/blocks/bubbles/textBubble/components/plate/MarkToolbarButton'

type Props = {
  id: string
  initialValue: TElement[]
  onChange: (content: TElement[]) => void
}

export const RichTextCaptionEditor = ({
  id,
  initialValue,
  onChange,
}: Props) => (
  <Plate
    id={id}
    plugins={platePlugins}
    initialValue={
      initialValue.length === 0
        ? [{ type: 'p', children: [{ text: '' }] }]
        : initialValue
    }
    onChange={onChange}
  >
    <RichTextCaptionEditorContent />
  </Plate>
)

const RichTextCaptionEditorContent = () => {
  const { t } = useTranslate()
  const editor = useEditorRef()
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<typeof editor.selection | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsVariableDropdownOpen(true)
  }

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!variable) return
    focusEditor(editor)
    insertText(editor, '{{' + variable.name + '}}')
  }

  const computeTargetCoord = useCallback(() => {
    if (rememberedSelection.current) return { top: 0, left: 0 }
    const selection = window.getSelection()
    const relativeParent = editorContainerRef.current
    if (!selection || !relativeParent || selection.rangeCount === 0)
      return { top: 0, left: 0 }
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
      ref={editorContainerRef}
      borderWidth="1px"
      rounded="md"
      pos="relative"
      spacing={0}
      cursor="text"
      className="prevent-group-drag"
      onContextMenuCapture={(e) => e.stopPropagation()}
    >
      <HStack
        bgColor={useColorModeValue('gray.50', 'gray.900')}
        borderTopRadius="md"
        p={1}
        w="full"
        boxSizing="border-box"
        borderBottomWidth={1}
      >
        <IconButton
          aria-label="Insert variable"
          size="xs"
          onMouseDown={handleVariablesButtonMouseDown}
          icon={<UserIcon />}
        />
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_BOLD)}
          icon={<BoldIcon />}
          aria-label="Toggle bold"
          size="xs"
        />
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_ITALIC)}
          icon={<ItalicIcon />}
          aria-label="Toggle italic"
          size="xs"
        />
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
          aria-label="Toggle underline"
          size="xs"
        />
      </HStack>
      <PlateContent
        onClick={() => setIsVariableDropdownOpen(false)}
        style={{
          ...editorStyle(useColorModeValue('white', colors.gray[850])),
          minHeight: '80px',
          padding: '0.5rem',
        }}
        onBlur={() => {
          if (!editor) return
          rememberedSelection.current = editor.selection
        }}
        onFocus={() => {
          rememberedSelection.current = null
        }}
        aria-label="Caption editor"
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
