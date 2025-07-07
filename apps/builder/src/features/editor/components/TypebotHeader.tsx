import {
  Flex,
  HStack,
  Button,
  IconButton,
  Tooltip,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  StackProps,
  chakra,
} from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  CopyIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { EditableTypebotName } from './EditableTypebotName'
import Link from 'next/link'
import { EditableEmojiOrImageIcon } from '@/components/EditableEmojiOrImageIcon'
import { useDebouncedCallback } from 'use-debounce'
import { PublishButton } from '@/features/publish/components/PublishButton'
import { headerHeight } from '../constants'
import { RightPanel, useEditor } from '../providers/EditorProvider'
import { useTypebot } from '../providers/TypebotProvider'
import { SupportBubble } from '@/components/SupportBubble'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { useTranslate } from '@tolgee/react'
import { GuestTypebotHeader } from './UnauthenticatedTypebotHeader'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'

export const TypebotHeader = () => {
  const { typebot, publishedTypebot, currentUserMode } = useTypebot()
  const { workspace } = useWorkspace()

  const { isOpen, onOpen } = useDisclosure()
  const headerBgColor = useColorModeValue('white', 'gray.900')

  const handleHelpClick = () => {
    isCloudProdInstance() && workspace?.plan && workspace.plan !== Plan.FREE
      ? onOpen()
      : window.open('https://docs.typebot.io/guides/how-to-get-help', '_blank')
  }

  if (currentUserMode === 'guest') return <GuestTypebotHeader />
  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      zIndex={1}
      pos="relative"
      bgColor={headerBgColor}
      flexShrink={0}
    >
      {isOpen && <SupportBubble autoShowDelay={0} />}
      <LeftElements pos="absolute" left="1rem" onHelpClick={handleHelpClick} />
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

const LeftElements = ({
  ...props
}: StackProps & { onHelpClick: () => void }) => {
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
        <IconButton
          as={Link}
          aria-label="Navigate back"
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
        />
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

  return (
    <HStack {...props}>
      <TypebotNav
        display={{ base: 'none', md: 'flex', xl: 'none' }}
        typebotId={typebot?.id}
        isResultsDisplayed={isResultsDisplayed}
      />

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
      {currentUserMode === 'guest' && (
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/duplicate`}
          leftIcon={<CopyIcon />}
          isLoading={isNotDefined(typebot)}
          size="sm"
        >
          Duplicate
        </Button>
      )}
      {currentUserMode === 'write' && <PublishButton size="sm" />}
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
      <Button
        as={Link}
        href={`/typebots/${typebotId}/edit`}
        colorScheme={router.pathname.includes('/edit') ? 'orange' : 'gray'}
        variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('editor.header.flowButton.label')}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/theme`}
        colorScheme={router.pathname.endsWith('theme') ? 'orange' : 'gray'}
        variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('editor.header.themeButton.label')}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/settings`}
        colorScheme={router.pathname.endsWith('settings') ? 'orange' : 'gray'}
        variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('editor.header.settingsButton.label')}
      </Button>
      <Button
        as={Link}
        href={`/typebots/${typebotId}/share`}
        colorScheme={router.pathname.endsWith('share') ? 'orange' : 'gray'}
        variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        size="sm"
      >
        {t('share.button.label')}
      </Button>
      {isResultsDisplayed && (
        <Button
          as={Link}
          href={`/typebots/${typebotId}/results`}
          colorScheme={router.pathname.includes('results') ? 'orange' : 'gray'}
          variant={router.pathname.includes('results') ? 'outline' : 'ghost'}
          size="sm"
        >
          {t('editor.header.resultsButton.label')}
        </Button>
      )}
    </HStack>
  )
}
