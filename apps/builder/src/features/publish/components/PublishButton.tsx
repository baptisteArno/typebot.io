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
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useRouter } from 'next/router'
import { isNotDefined } from '@sniper.io/lib'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { isFreePlan } from '@/features/billing/helpers/isFreePlan'
import { T, useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { ConfirmModal } from '@/components/ConfirmModal'
import { TextLink } from '@/components/TextLink'
import { useTimeSince } from '@/hooks/useTimeSince'

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
  const {
    isOpen: isNewEngineWarningOpen,
    onOpen: onNewEngineWarningOpen,
    onClose: onNewEngineWarningClose,
  } = useDisclosure()
  const {
    isPublished,
    publishedSniper,
    restorePublishedSniper,
    sniper,
    isSavingLoading,
    updateSniper,
    save,
    publishedSniperVersion,
  } = useSniper()
  const timeSinceLastPublish = useTimeSince(
    publishedSniper?.updatedAt.toString()
  )
  const { showToast } = useToast()

  const {
    sniper: {
      getPublishedSniper: { refetch: refetchPublishedSniper },
    },
  } = trpc.useContext()

  const { mutate: publishSniperMutate, isLoading: isPublishing } =
    trpc.sniper.publishSniper.useMutation({
      onError: (error) => {
        showToast({
          title: t('publish.error.label'),
          description: error.message,
        })
        if (error.data?.httpStatus === 403) {
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        }
      },
      onSuccess: () => {
        refetchPublishedSniper({
          sniperId: sniper?.id as string,
        })
        if (!publishedSniper && !pathname.endsWith('share'))
          push(`/snipers/${query.sniperId}/share`)
      },
    })

  const { mutate: unpublishSniperMutate, isLoading: isUnpublishing } =
    trpc.sniper.unpublishSniper.useMutation({
      onError: (error) =>
        showToast({
          title: t('editor.header.unpublishSniper.error.label'),
          description: error.message,
        }),
      onSuccess: () => {
        refetchPublishedSniper()
      },
    })

  const hasInputFile = sniper?.groups
    .flatMap((g) => g.blocks)
    .some((b) => b.type === InputBlockType.FILE)

  const handlePublishClick = async () => {
    if (!sniper?.id) return
    if (isFreePlan(workspace) && hasInputFile) return onOpen()
    if (!sniper.publicId) {
      await updateSniper({
        updates: {
          publicId: parseDefaultPublicId(sniper.name, sniper.id),
        },
        save: true,
      })
    } else await save()
    publishSniperMutate({
      sniperId: sniper.id,
    })
  }

  const unpublishSniper = async () => {
    if (!sniper?.id) return
    if (sniper.isClosed)
      await updateSniper({ updates: { isClosed: false }, save: true })
    unpublishSniperMutate({
      sniperId: sniper?.id,
    })
  }

  const closeSniper = async () => {
    await updateSniper({ updates: { isClosed: true }, save: true })
  }

  const openSniper = async () => {
    await updateSniper({ updates: { isClosed: false }, save: true })
  }

  return (
    <HStack spacing="1px">
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t('billing.limitMessage.fileInput')}
      />
      {publishedSniper && publishedSniperVersion !== sniper?.version && (
        <ConfirmModal
          isOpen={isNewEngineWarningOpen}
          onConfirm={handlePublishClick}
          onClose={onNewEngineWarningClose}
          confirmButtonColor="blue"
          title={t('publish.versionWarning.title.label')}
          message={
            <Stack spacing="3">
              <Text>
                {t('publish.versionWarning.message.aboutToDeploy.label')}
              </Text>
              <Text fontWeight="bold">
                <T
                  keyName="publish.versionWarning.checkBreakingChanges"
                  params={{
                    link: (
                      <TextLink
                        href="https://docs.sniper.io/breaking-changes#sniper-v6"
                        isExternal
                      />
                    ),
                  }}
                />
              </Text>
              <Text>
                {t('publish.versionWarning.message.testInPreviewMode.label')}
              </Text>
            </Stack>
          }
          confirmButtonLabel={t('publishButton.label')}
        />
      )}
      <Tooltip
        placement="bottom-end"
        label={
          <Stack>
            <Text>{t('publishButton.tooltip.nonPublishedChanges.label')}</Text>
            {timeSinceLastPublish ? (
              <Text fontStyle="italic">
                <T
                  keyName="publishButton.tooltip.publishedVersion.from.label"
                  params={{
                    timeSince: timeSinceLastPublish,
                  }}
                />
              </Text>
            ) : null}
          </Stack>
        }
        isDisabled={isNotDefined(publishedSniper) || isPublished}
      >
        <Button
          colorScheme="blue"
          isLoading={isPublishing || isUnpublishing}
          isDisabled={isPublished || isSavingLoading}
          onClick={() => {
            publishedSniper && publishedSniperVersion !== sniper?.version
              ? onNewEngineWarningOpen()
              : handlePublishClick()
          }}
          borderRightRadius={
            publishedSniper && !isMoreMenuDisabled ? 0 : undefined
          }
          {...props}
        >
          {isPublished
            ? sniper?.isClosed
              ? t('publishButton.closed.label')
              : t('publishButton.published.label')
            : t('publishButton.label')}
        </Button>
      </Tooltip>

      {!isMoreMenuDisabled && publishedSniper && (
        <Menu>
          <MenuButton
            as={IconButton}
            colorScheme={'blue'}
            borderLeftRadius={0}
            icon={<ChevronLeftIcon transform="rotate(-90deg)" />}
            aria-label={t('publishButton.dropdown.showMenu.label')}
            size="sm"
            isDisabled={isPublishing || isSavingLoading}
          />
          <MenuList>
            {!isPublished && (
              <MenuItem onClick={restorePublishedSniper}>
                {t('publishButton.dropdown.restoreVersion.label')}
              </MenuItem>
            )}
            {!sniper?.isClosed ? (
              <MenuItem onClick={closeSniper} icon={<LockedIcon />}>
                {t('publishButton.dropdown.close.label')}
              </MenuItem>
            ) : (
              <MenuItem onClick={openSniper} icon={<UnlockedIcon />}>
                {t('publishButton.dropdown.reopen.label')}
              </MenuItem>
            )}
            <MenuItem onClick={unpublishSniper} icon={<CloudOffIcon />}>
              {t('publishButton.dropdown.unpublish.label')}
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  )
}
