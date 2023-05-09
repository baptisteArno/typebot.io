import { BuoyIcon, ExpandIcon } from '@/components/icons'
import {
  Button,
  HStack,
  IconButton,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import { BlockWithOptions } from '@typebot.io/schemas'
import { getHelpDocUrl } from '@/features/graph/helpers/getHelpDocUrl'

type Props = {
  blockType: BlockWithOptions['type']
  onExpandClick: () => void
}

export const SettingsHoverBar = ({ blockType, onExpandClick }: Props) => {
  const helpDocUrl = getHelpDocUrl(blockType)
  return (
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue('white', 'gray.800')}
      shadow="md"
    >
      <IconButton
        icon={<ExpandIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        borderLeftRadius="none"
        aria-label={'Duplicate group'}
        variant="ghost"
        onClick={onExpandClick}
        size="xs"
      />
      <Button
        as={Link}
        leftIcon={<BuoyIcon />}
        borderLeftRadius="none"
        size="xs"
        variant="ghost"
        href={helpDocUrl}
        isExternal
      >
        Help
      </Button>
    </HStack>
  )
}
