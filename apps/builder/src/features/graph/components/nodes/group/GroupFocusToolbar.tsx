import { CopyIcon, InfoIcon, PlayIcon, TrashIcon } from '@/components/icons'
import {
  HStack,
  IconButton,
  Tooltip,
  useClipboard,
  useColorModeValue,
} from '@chakra-ui/react'

type Props = {
  groupId: string
  onPlayClick: () => void
}

export const GroupFocusToolbar = ({ groupId, onPlayClick }: Props) => {
  const { hasCopied, onCopy } = useClipboard(groupId)

  const dispatchCopyEvent = () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
  }

  const dispatchDeleteEvent = () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
  }

  return (
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue('white', 'gray.800')}
      shadow="md"
    >
      <IconButton
        icon={<PlayIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        aria-label={'Preview bot from this group'}
        variant="ghost"
        onClick={onPlayClick}
        size="sm"
      />
      <IconButton
        icon={<CopyIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Copy group'}
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          dispatchCopyEvent()
        }}
        size="sm"
      />
      <Tooltip
        label={hasCopied ? 'Copied!' : groupId}
        closeOnClick={false}
        placement="top"
      >
        <IconButton
          icon={<InfoIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={'Show group info'}
          variant="ghost"
          size="sm"
          onClick={onCopy}
        />
      </Tooltip>
      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        icon={<TrashIcon />}
        onClick={dispatchDeleteEvent}
        variant="ghost"
        size="sm"
      />
    </HStack>
  )
}
