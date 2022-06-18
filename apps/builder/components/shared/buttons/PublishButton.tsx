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
  useDisclosure,
  ButtonProps,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import { InputBlockType } from 'models'
import { useRouter } from 'next/router'
import { timeSince } from 'services/utils'
import { isFreePlan } from 'services/workspace'
import { isNotDefined } from 'utils'
import { UpgradeModal } from '../modals/UpgradeModal'
import { LimitReached } from '../modals/UpgradeModal/UpgradeModal'

export const PublishButton = (props: ButtonProps) => {
  const { workspace } = useWorkspace()
  const { push, query } = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isPublishing,
    isPublished,
    publishTypebot,
    publishedTypebot,
    restorePublishedTypebot,
    typebot,
    isSavingLoading,
  } = useTypebot()

  const hasInputFile = typebot?.groups
    .flatMap((g) => g.blocks)
    .some((b) => b.type === InputBlockType.FILE)

  const handlePublishClick = () => {
    if (isFreePlan(workspace) && hasInputFile) return onOpen()
    publishTypebot()
    if (!publishedTypebot) push(`/typebots/${query.typebotId}/share`)
  }

  return (
    <HStack spacing="1px">
      <UpgradeModal
        plan={Plan.PRO}
        isOpen={isOpen}
        onClose={onClose}
        type={LimitReached.FILE_INPUT}
      />
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
          isLoading={isPublishing || isSavingLoading}
          isDisabled={isPublished}
          onClick={handlePublishClick}
          borderRightRadius={publishedTypebot && !isPublished ? 0 : undefined}
          {...props}
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
