import {
  Button,
  HStack,
  IconButton,
  Stack,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useRouter } from 'next/router'
import { timeSince } from 'services/utils'
import { isNotDefined } from 'utils'

export const PublishButton = () => {
  const { push, query } = useRouter()
  const {
    isPublishing,
    isPublished,
    publishTypebot,
    publishedTypebot,
    restorePublishedTypebot,
  } = useTypebot()

  const handlePublishClick = () => {
    publishTypebot()
    if (!publishedTypebot) push(`${process.env.BASE_PATH || ''}/typebots/${query.typebotId}/share`)
  }

  return (
    <HStack spacing="1px">
      <Tooltip
        borderRadius="md"
        hasArrow
        placement="bottom-end"
        label={
          <Stack>
            <Text>There are non published changes.</Text>
            <Text fontStyle="italic">
              Published version from{' '}
              {publishedTypebot &&
                timeSince(publishedTypebot.updatedAt.toString())}{' '}
              ago
            </Text>
          </Stack>
        }
        isDisabled={isNotDefined(publishedTypebot)}
      >
        <Button
          colorScheme="blue"
          isLoading={isPublishing}
          isDisabled={isPublished}
          onClick={handlePublishClick}
          borderRightRadius={publishedTypebot && !isPublished ? 0 : undefined}
        >
          {isPublished ? 'Published' : 'Publish'}
        </Button>
      </Tooltip>

      {publishedTypebot && !isPublished && (
        <Menu>
          <MenuButton
            as={IconButton}
            colorScheme="blue"
            borderLeftRadius={0}
            icon={<ChevronLeftIcon transform="rotate(-90deg)" />}
            aria-label="Show published version"
          />
          <MenuList>
            <MenuItem onClick={restorePublishedTypebot}>
              Restore published version
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  )
}
