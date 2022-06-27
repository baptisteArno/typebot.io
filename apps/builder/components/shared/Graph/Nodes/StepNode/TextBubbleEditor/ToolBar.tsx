import { StackProps, HStack, Button } from '@chakra-ui/react'
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks'
import { getPluginType, PlateEditor, Value } from '@udecode/plate-core'
import { LinkToolbarButton } from '@udecode/plate-ui-link'
import { MarkToolbarButton } from '@udecode/plate-ui-toolbar'
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon } from 'assets/icons'

type Props = {
  editor: PlateEditor<Value>
  onVariablesButtonClick: () => void
} & StackProps

export const ToolBar = ({
  editor,
  onVariablesButtonClick,
  ...props
}: Props) => {
  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onVariablesButtonClick()
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
        Variáveis
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
