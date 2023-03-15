import { CopyIcon, PlayIcon, TrashIcon } from '@/components/icons'
import { HStack, IconButton, useColorModeValue } from '@chakra-ui/react'

type Props = {
  onPlayClick: () => void
  onDuplicateClick: () => void
  onDeleteClick: () => void
}

export const GroupFocusToolbar = ({
  onPlayClick,
  onDuplicateClick,
  onDeleteClick,
}: Props) => {
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
        aria-label={'Duplicate group'}
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          onDuplicateClick()
        }}
        size="sm"
      />
      <IconButton
        aria-label="Delete"
        borderLeftRadius="none"
        icon={<TrashIcon />}
        onClick={onDeleteClick}
        variant="ghost"
        size="sm"
      />
    </HStack>
  )
}
