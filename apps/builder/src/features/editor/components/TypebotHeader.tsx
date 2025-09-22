import { EditableEmojiOrImageIcon } from '@/components/EditableEmojiOrImageIcon'
import {
  ChevronLeftIcon,
  CopyIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons'
import { SupportBubble } from '@/components/SupportBubble'
import { PublishButton } from '@/features/publish/components/PublishButton'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { trpc } from '@/lib/trpc'
import {
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  StackProps,
  Text,
  Tooltip,
  chakra,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { headerHeight } from '../constants'
import { RightPanel, useEditor } from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { EditableTypebotName } from './EditableTypebotName'
import { GuestTypebotHeader } from './UnauthenticatedTypebotHeader'
import { OnlineUsersIndicator } from './OnlineUsersIndicator'
import { useEditQueue } from '../hooks/useEditQueue'
import { useUser } from '@/features/account/hooks/useUser'

export const TypebotHeader = () => {
  const { typebot, publishedTypebot, currentUserMode } = useTypebot()
  const { isOpen } = useDisclosure()
  const headerBgColor = useColorModeValue('white', 'gray.900')

  if (currentUserMode === 'guest') return <GuestTypebotHeader />
  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      zIndex={100}
      pos="relative"
      bgColor={headerBgColor}
      flexShrink={0}
    >
      {isOpen && <SupportBubble autoShowDelay={0} />}
      <LeftElements pos="absolute" left="1rem" />

      <TypebotNav
        display={{ base: 'none', xl: 'flex' }}
        pos={{ base: 'absolute' }}
        typebotId={typebot?.id}
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
      <RightElements
        right="40px"
        pos="absolute"
        display={['none', 'flex']}
        isResultsDisplayed={isDefined(publishedTypebot)}
      />
    </Flex>
  )
}

const LeftElements = ({ ...props }: StackProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const {
    typebot,
    updateTypebot,
    canUndo,
    canRedo,
    undo,
    redo,
    currentUserMode,
    isSavingLoading,
  } = useTypebot()
  const { leaveQueue } = useEditQueue(typebot?.id)
  const { user } = useUser()

  const [isRedoShortcutTooltipOpen, setRedoShortcutTooltipOpen] =
    useState(false)

  const [isUndoShortcutTooltipOpen, setUndoShortcutTooltipOpen] =
    useState(false)

  const hideUndoShortcutTooltipLater = useDebouncedCallback(() => {
    setUndoShortcutTooltipOpen(false)
  }, 1000)

  const hideRedoShortcutTooltipLater = useDebouncedCallback(() => {
    setRedoShortcutTooltipOpen(false)
  }, 1000)

  const handleNameSubmit = (name: string) =>
    updateTypebot({ updates: { name } })

  const handleChangeIcon = (icon: string) =>
    updateTypebot({ updates: { icon } })

  useKeyboardShortcuts({
    undo: () => {
      if (!canUndo) return
      hideUndoShortcutTooltipLater.flush()
      setUndoShortcutTooltipOpen(true)
      hideUndoShortcutTooltipLater()
      undo()
    },
    redo: () => {
      if (!canRedo) return
      hideUndoShortcutTooltipLater.flush()
      setRedoShortcutTooltipOpen(true)
      hideRedoShortcutTooltipLater()
      redo()
    },
  })

  return (
    <HStack justify="center" align="center" spacing="6" {...props}>
      <HStack alignItems="center" spacing={3}>
        {router.query.embedded !== 'true' && (
          <IconButton
            as={Link}
            aria-label={t('editor.header.navigateBack.ariaLabel')}
            icon={<ChevronLeftIcon fontSize={25} />}
            href={{
              pathname: router.query.parentId
                ? '/typebots/[typebotId]/edit'
                : typebot?.folderId
                ? '/typebots/folders/[id]'
                : '/typebots',
              query: {
                id: typebot?.folderId ?? [],
                parentId: Array.isArray(router.query.parentId)
                  ? router.query.parentId.slice(0, -1)
                  : [],
                typebotId: Array.isArray(router.query.parentId)
                  ? [...router.query.parentId].pop()
                  : router.query.parentId ?? [],
              },
            }}
            size="sm"
            onClick={() => user && leaveQueue(user.id)}
          />
        )}
        <HStack spacing={1}>
          {typebot && (
            <EditableEmojiOrImageIcon
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                fileName: 'icon',
              }}
              icon={typebot?.icon}
              onChangeIcon={handleChangeIcon}
            />
          )}
          (
          <EditableTypebotName
            key={`typebot-name-${typebot?.name ?? ''}`}
            defaultName={typebot?.name ?? ''}
            onNewName={handleNameSubmit}
          />
          )
        </HStack>

        {currentUserMode === 'write' && (
          <HStack>
            <Tooltip
              label={
                isUndoShortcutTooltipOpen
                  ? t('editor.header.undo.tooltip.label')
                  : t('editor.header.undoButton.label')
              }
              isOpen={isUndoShortcutTooltipOpen ? true : undefined}
              hasArrow={isUndoShortcutTooltipOpen}
            >
              <IconButton
                display={['none', 'flex']}
                icon={<UndoIcon />}
                size="sm"
                aria-label={t('editor.header.undoButton.label')}
                onClick={undo}
                isDisabled={!canUndo}
              />
            </Tooltip>

            <Tooltip
              label={
                isRedoShortcutTooltipOpen
                  ? t('editor.header.undo.tooltip.label')
                  : t('editor.header.redoButton.label')
              }
              isOpen={isRedoShortcutTooltipOpen ? true : undefined}
              hasArrow={isRedoShortcutTooltipOpen}
            >
              <IconButton
                display={['none', 'flex']}
                icon={<RedoIcon />}
                size="sm"
                aria-label={t('editor.header.redoButton.label')}
                onClick={redo}
                isDisabled={!canRedo}
              />
            </Tooltip>
          </HStack>
        )}
        {/* <Button
          leftIcon={<BuoyIcon />}
          onClick={onHelpClick}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
          <chakra.span display={{ base: 'none', xl: 'inline' }}>
            {t('editor.header.helpButton.label')}
          </chakra.span>
        </Button> */}
      </HStack>
      {isSavingLoading && (
        <HStack>
          <Spinner speed="0.7s" size="sm" color="gray.400" />
          <Text fontSize="sm" color="gray.400">
            {t('editor.header.savingSpinner.label')}
          </Text>
        </HStack>
      )}
    </HStack>
  )
}

const RightElements = ({
  isResultsDisplayed,
  ...props
}: StackProps & { isResultsDisplayed: boolean }) => {
  const router = useRouter()
  const { t } = useTranslate()
  const { typebot, currentUserMode, save, isSavingLoading } = useTypebot()
  const {
    setRightPanel,
    rightPanel,
    setStartPreviewAtGroup,
    setStartPreviewAtEvent,
  } = useEditor()

  const handlePreviewClick = async () => {
    setStartPreviewAtGroup(undefined)
    setStartPreviewAtEvent(undefined)
    await save()
    setRightPanel(RightPanel.PREVIEW)
  }

  const { isUserEditing } = useEditor()

  const selectedUserMode = isUserEditing ? currentUserMode : 'guest'

  const { mutate: duplicateTypebot, isLoading: isDuplicating } =
    trpc.typebot.importTypebot.useMutation({
      onSuccess: (data) => {
        window.location.href = `/typebots/${data.typebot.id}/edit`
      },
    })

  const handleDuplicate = () => {
    if (!typebot?.workspaceId || !typebot) return
    duplicateTypebot({
      workspaceId: typebot.workspaceId,
      typebot: {
        ...typebot,
        name: `${typebot.name} ${t('editor.header.user.duplicateSuffix')}`,
      },
    })
  }

  return (
    <HStack {...props}>
      <TypebotNav
        display={{ base: 'none', md: 'flex', xl: 'none' }}
        typebotId={typebot?.id}
        isResultsDisplayed={isResultsDisplayed}
      />

      <OnlineUsersIndicator />

      {/* <Flex pos="relative">
        <ShareTypebotButton isLoading={isNotDefined(typebot)} />
      </Flex> */}

      {selectedUserMode === 'guest' && (
        <Tooltip label={t('editor.header.user.duplicate.tooltip')} hasArrow>
          <Button
            size="sm"
            colorScheme="blue"
            variant="solid"
            leftIcon={<CopyIcon />}
            onClick={handleDuplicate}
            isLoading={isDuplicating}
            loadingText={t('editor.header.user.duplicating.loadingText')}
            px={3}
            py={1}
          >
            {t('editor.header.user.duplicateButton.label')}
          </Button>
        </Tooltip>
      )}

      {router.pathname.includes('/edit') &&
        rightPanel !== RightPanel.PREVIEW && (
          <Button
            colorScheme="gray"
            onClick={handlePreviewClick}
            isLoading={isNotDefined(typebot) || isSavingLoading}
            leftIcon={<PlayIcon />}
            size="sm"
            iconSpacing={{ base: 0, xl: 2 }}
          >
            <chakra.span display={{ base: 'none', xl: 'inline' }}>
              {t('editor.header.previewButton.label')}
            </chakra.span>
          </Button>
        )}

      {selectedUserMode === 'write' && <PublishButton size="sm" />}
    </HStack>
  )
}

const TypebotNav = ({
  typebotId,
  isResultsDisplayed,
  ...stackProps
}: {
  typebotId?: string
  isResultsDisplayed: boolean
} & StackProps) => {
  const { t } = useTranslate()
  const router = useRouter()

  return (
    <HStack {...stackProps}>
      {router.query.embedded !== 'true' && (
        <Button
          as={Link}
          href={`/typebots/${typebotId}/edit`}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.flowButton.label')}
        </Button>
      )}
      {/* <Button
        as={Link}
        href={`/typebots/${typebotId}/theme`}
        colorScheme={router.pathname.endsWith('theme') ? 'blue' : 'gray'}
        variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('editor.header.themeButton.label')}
      </Button> */}
      {/* <Button
        as={Link}
        href={`/typebots/${typebotId}/settings`}
        colorScheme={router.pathname.endsWith('settings') ? 'blue' : 'gray'}
        variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('editor.header.settingsButton.label')}
      </Button> */}
      {router.query.embedded !== 'true' && (
        <Button
          as={Link}
          href={`/typebots/${typebotId}/share`}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('share.button.label')}
        </Button>
      )}
      {isResultsDisplayed && router.query.embedded !== 'true' && (
        <Button
          as={Link}
          href={`/typebots/${typebotId}/results`}
          colorScheme={router.pathname.includes('results') ? 'blue' : 'gray'}
          variant={router.pathname.includes('results') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.resultsButton.label')}
        </Button>
      )}
    </HStack>
  )
}
