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
import {
  ChevronLeftIcon,
  CloudOffIcon,
  LockedIcon,
  UnlockedIcon,
} from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useRouter } from 'next/router'
import { isNotDefined } from '@typebot.io/lib'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { parseTimeSince } from '@/helpers/parseTimeSince'
import { useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { ConfirmModal } from '@/components/ConfirmModal'
import { TextLink } from '@/components/TextLink'
import { useUser } from '@/features/account/hooks/useUser'

type Props = ButtonProps & {
  isMoreMenuDisabled?: boolean
}
export const PublishButton = ({
  isMoreMenuDisabled = false,
  ...props
}: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { push, query, pathname } = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logOut } = useUser()
  const {
    isOpen: isNewEngineWarningOpen,
    onOpen: onNewEngineWarningOpen,
    onClose: onNewEngineWarningClose,
  } = useDisclosure()
  const {
    isPublished,
    publishedTypebot,
    restorePublishedTypebot,
    typebot,
    isSavingLoading,
    updateTypebot,
    save,
    publishedTypebotVersion,
  } = useTypebot()
  const { showToast } = useToast()

  const {
    typebot: {
      getPublishedTypebot: { refetch: refetchPublishedTypebot },
    },
  } = trpc.useContext()

  const { mutate: publishTypebotMutate, isLoading: isPublishing } =
    trpc.typebot.publishTypebot.useMutation({
      onError: (error) => {
        showToast({
          title: t('editor.headers.publishTypebot.error.label'),
          description: error.message,
        })
        if (error.data?.httpStatus === 403) logOut()
      },
      onSuccess: () => {
        refetchPublishedTypebot({
          typebotId: typebot?.id as string,
        })
        if (!publishedTypebot && !pathname.endsWith('share'))
          push(`/typebots/${query.typebotId}/share`)
      },
    })

  const { mutate: unpublishTypebotMutate, isLoading: isUnpublishing } =
    trpc.typebot.unpublishTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: t('editor.headers.unpublishTypebot.error.label'),
          description: error.message,
        }),
      onSuccess: () => {
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
      {publishedTypebot && publishedTypebotVersion !== typebot?.version && (
        <ConfirmModal
          isOpen={isNewEngineWarningOpen}
          onConfirm={handlePublishClick}
          onClose={onNewEngineWarningClose}
          confirmButtonColor="blue"
          title={t('editor.headers.publishTypebot.versionWarning.title.label')}
          message={
            <Stack spacing="3">
              <Text>
                {t(
                  'editor.headers.publishTypebot.versionWarning.message.aboutToDeploy.label'
                )}
              </Text>
              <Text fontWeight="bold">
                {t(
                  'editor.headers.publishTypebot.versionWarning.message.check.label'
                )}{' '}
                <TextLink
                  href="https://docs.typebot.io/breaking-changes#typebot-v6"
                  isExternal
                >
                  {t(
                    'editor.headers.publishTypebot.versionWarning.breakingChanges.check.label'
                  )}
                </TextLink>
              </Text>
              <Text>
                {' '}
                {t(
                  'editor.headers.publishTypebot.versionWarning.testInPreviewMode.check.label'
                )}
              </Text>
            </Stack>
          }
          confirmButtonLabel={t('editor.headers.publishButton.label')}
        />
      )}
      <Tooltip
        placement="bottom-end"
        label={
          <Stack>
            <Text>
              {t(
                'editor.headers.publishButton.tooltip.nonPublishedChanges.label'
              )}
            </Text>
            <Text fontStyle="italic">
              {t(
                'editor.headers.publishButton.tooltip.publishedVersion.from.label'
              )}{' '}
              {publishedTypebot &&
                parseTimeSince(publishedTypebot.updatedAt.toString())}{' '}
              {t(
                'editor.headers.publishButton.tooltip.publishedVersion.ago.label'
              )}
            </Text>
          </Stack>
        }
        isDisabled={isNotDefined(publishedTypebot) || isPublished}
      >
        <Button
          colorScheme="blue"
          isLoading={isPublishing || isUnpublishing}
          isDisabled={isPublished || isSavingLoading}
          onClick={() => {
            publishedTypebot && publishedTypebotVersion !== typebot?.version
              ? onNewEngineWarningOpen()
              : handlePublishClick()
          }}
          borderRightRadius={
            publishedTypebot && !isMoreMenuDisabled ? 0 : undefined
          }
          {...props}
        >
          {isPublished
            ? typebot?.isClosed
              ? t('editor.headers.publishButton.closed.label')
              : t('editor.headers.publishedButton.label')
            : t('editor.headers.publishButton.label')}
        </Button>
      </Tooltip>

      {!isMoreMenuDisabled && publishedTypebot && (
        <Menu>
          <MenuButton
            as={IconButton}
            colorScheme={'blue'}
            borderLeftRadius={0}
            icon={<ChevronLeftIcon transform="rotate(-90deg)" />}
            aria-label={t(
              'editor.headers.publishedButtonDropdown.showMenu.ariaLabel'
            )}
            size="sm"
            isDisabled={isPublishing || isSavingLoading}
          />
          <MenuList>
            {!isPublished && (
              <MenuItem onClick={restorePublishedTypebot}>
                {t('editor.headers.publishedTypebot.restoreVersion.label')}
              </MenuItem>
            )}
            {!typebot?.isClosed ? (
              <MenuItem onClick={closeTypebot} icon={<LockedIcon />}>
                {t('editor.headers.publishedButtonDropdown.close.label')}
              </MenuItem>
            ) : (
              <MenuItem onClick={openTypebot} icon={<UnlockedIcon />}>
                {t('editor.headers.publishedButtonDropdown.reopen.label')}
              </MenuItem>
            )}
            <MenuItem onClick={unpublishTypebot} icon={<CloudOffIcon />}>
              {t('editor.headers.publishedButtonDropdown.unpublish.label')}
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  )
}
