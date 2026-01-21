import { HStack, useColorModeValue, IconButton } from '@chakra-ui/react'
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks'
import { getPluginType, useEditorRef } from '@udecode/plate-core'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  UnderlineIcon,
  UserIcon,
} from '@/components/icons'
import { MarkToolbarButton } from '@/features/blocks/bubbles/textBubble/components/plate/MarkToolbarButton'
import { LinkToolbarButton } from '@/features/blocks/bubbles/textBubble/components/plate/LinkToolbarButton'

type Props = {
  onVariablesButtonClick: () => void
}

export const NoteToolBar = ({ onVariablesButtonClick }: Props) => {
  const editor = useEditorRef()

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onVariablesButtonClick()
  }

  return (
    <HStack
      bgColor={useColorModeValue('yellow.50', 'yellow.900')}
      borderTopRadius="md"
      p={2}
      w="full"
      boxSizing="border-box"
      borderBottomWidth={1}
    >
      <IconButton
        aria-label="Insert variable"
        size="sm"
        onMouseDown={handleVariablesButtonMouseDown}
        icon={<UserIcon />}
      />
      <span data-testid="bold-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_BOLD)}
          icon={<BoldIcon />}
          aria-label="Toggle bold"
        />
      </span>
      <span data-testid="italic-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_ITALIC)}
          icon={<ItalicIcon />}
          aria-label="Toggle italic"
        />
      </span>
      <span data-testid="underline-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
          aria-label="Toggle underline"
        />
      </span>
      <span data-testid="link-button">
        <LinkToolbarButton icon={<LinkIcon />} aria-label="Add link" />
      </span>
    </HStack>
  )
}
