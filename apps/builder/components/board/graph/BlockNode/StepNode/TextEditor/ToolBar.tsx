import { StackProps, HStack, Button } from '@chakra-ui/react'
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks'
import { usePlateEditorRef, getPluginType } from '@udecode/plate-core'
import { LinkToolbarButton } from '@udecode/plate-ui-link'
import { MarkToolbarButton } from '@udecode/plate-ui-toolbar'
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon } from 'assets/icons'

export const ToolBar = (props: StackProps) => {
  const editor = usePlateEditorRef()
  return (
    <HStack
      bgColor={'white'}
      borderTopRadius="md"
      p={2}
      w="full"
      boxSizing="border-box"
      borderBottomWidth={1}
      {...props}
    >
      <Button size="sm">Variables</Button>
      <MarkToolbarButton
        type={getPluginType(editor, MARK_BOLD)}
        icon={<BoldIcon />}
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<ItalicIcon />}
      />
      <MarkToolbarButton
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<UnderlineIcon />}
      />
      <LinkToolbarButton icon={<LinkIcon />} />
    </HStack>
  )
}
