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

type Props = { onVariablesButtonClick: () => void } & StackProps
export const ToolBar = (props: Props) => {
  const editor = usePlateEditorRef()

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const { onVariablesButtonClick} = props
    props.onVariablesButtonClick()
  }
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
      <Button size="sm" onMouseDown={handleVariablesButtonMouseDown}>
        Variables
      </Button>
      <span data-testid="bold-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_BOLD)}
          icon={<BoldIcon />}
        />
      </span>
      <span data-testid="italic-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_ITALIC)}
          icon={<ItalicIcon />}
        />
      </span>
      <span data-testid="underline-button">
        <MarkToolbarButton
          type={getPluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
        />
      </span>
      <span data-testid="link-button">
        <LinkToolbarButton icon={<LinkIcon />} />
      </span>
    </HStack>
  )
}
