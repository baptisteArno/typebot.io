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
  useColorModeValue,
} from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  CloudOffIcon,
  LockedIcon,
  UnlockedIcon,
} from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { InputBlockType } from '@typebot.io/schemas'
import { useRouter } from 'next/router'
import { isNotDefined } from '@typebot.io/lib'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { parseTimeSince } from '@/helpers/parseTimeSince'
import { useI18n } from '@/locales'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'

export const PublishButton = (props: ButtonProps) => {
  const t = useI18n()
  const warningTextColor = useColorModeValue('red.300', 'red.600')
  const { workspace } = useWorkspace()
  const { push, query } = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isPublished,
    publishedTypebot,
    restorePublishedTypebot,
    typebot,
    isSavingLoading,
    updateTypebot,
    save,
  } = useTypebot()
  const { showToast } = useToast()

  const {
    typebot: {
      getPublishedTypebot: { refetch: refetchPublishedTypebot },
    },
  } = trpc.useContext()

  const { mutate: publishTypebotMutate, isLoading: isPublishing } =
    trpc.typebot.publishTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while publishing typebot',
          description: error.message,
        }),
      onSuccess: () => {
        if (!publishedTypebot) push(`/typebots/${query.typebotId}/share`)
        refetchPublishedTypebot()
      },
    })

  const { mutate: unpublishTypebotMutate, isLoading: isUnpublishing } =
    trpc.typebot.unpublishTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while unpublishing typebot',
          description: error.message,
        }),
      onSuccess: () => {
        if (!publishedTypebot) push(`/typebots/${query.typebotId}/share`)
        refetchPublishedTypebot()
      },
    })

  const hasInputFile = typebot?.groups
    .flatMap((g) => g.blocks)
    .some((b) => b.type === InputBlockType.FILE)

  const handlePublishClick = async () => {
    if (!typebot?.id) return
    if (isFreePlan(workspace) && hasInputFile) return onOpen()
    if (!typebot.publicId) {
      await updateTypebot({
        updates: {
          publicId: parseDefaultPublicId(typebot.name, typebot.id),
        },
        save: true,
      })
    } else await save()
    publishTypebotMutate({
      typebotId: typebot.id,
    })
  }

  const unpublishTypebot = async () => {
    if (!typebot?.id) return
    if (typebot.isClosed)
      await updateTypebot({ updates: { isClosed: false }, save: true })
    unpublishTypebotMutate({
      typebotId: typebot?.id,
    })
  }

  const closeTypebot = async () => {
    await updateTypebot({ updates: { isClosed: true }, save: true })
  }

  const openTypebot = async () => {
    await updateTypebot({ updates: { isClosed: false }, save: true })
  }

  return (
    <HStack spacing="1px">
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.fileInput')}
      />
      <Tooltip
        placement="bottom-end"
        label={
          <Stack>
            {!publishedTypebot?.version ? (
              <Text color={warningTextColor} fontWeight="semibold">
                This will deploy your bot with an updated engine. Make sure to
                test it properly in preview mode before publishing.
              </Text>
            ) : (
              <Text>There are non published changes.</Text>
            )}
            <Text fontStyle="italic">
              Published version from{' '}
              {publishedTypebot &&
                parseTimeSince(publishedTypebot.updatedAt.toString())}{' '}
              ago
            </Text>
          </Stack>
        }
        isDisabled={isNotDefined(publishedTypebot) || isPublished}
      >
        <Button
          colorScheme="blue"
          isLoading={isPublishing || isUnpublishing}
          isDisabled={isPublished || isSavingLoading}
          onClick={handlePublishClick}
          borderRightRadius={publishedTypebot ? 0 : undefined}
          {...props}
        >
          {isPublished
            ? typebot?.isClosed
              ? 'Closed'
              : 'Published'
            : 'Publish'}
        </Button>
      </Tooltip>

      {publishedTypebot && (
        <Menu>
          <MenuButton
            as={IconButton}
            colorScheme={'blue'}
            borderLeftRadius={0}
            icon={<ChevronLeftIcon transform="rotate(-90deg)" />}
            aria-label="Show published typebot menu"
            size="sm"
            isDisabled={isPublishing || isSavingLoading}
          />
          <MenuList>
            {!isPublished && (
              <MenuItem onClick={restorePublishedTypebot}>
                Restore published version
              </MenuItem>
            )}
            {!typebot?.isClosed ? (
              <MenuItem onClick={closeTypebot} icon={<LockedIcon />}>
                Close typebot to new responses
              </MenuItem>
            ) : (
              <MenuItem onClick={openTypebot} icon={<UnlockedIcon />}>
                Reopen typebot to new responses
              </MenuItem>
            )}
            <MenuItem onClick={unpublishTypebot} icon={<CloudOffIcon />}>
              Unpublish typebot
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  )
}
