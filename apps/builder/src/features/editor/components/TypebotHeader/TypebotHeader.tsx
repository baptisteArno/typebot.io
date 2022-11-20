import {
  Flex,
  HStack,
  Button,
  IconButton,
  Tooltip,
  Spinner,
  Text,
} from '@chakra-ui/react'
import {
  BuoyIcon,
  ChevronLeftIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons'
import { RightPanel, useEditor } from '../../providers/EditorProvider'
import { useTypebot } from '../../providers/TypebotProvider'
import { useRouter } from 'next/router'
import React from 'react'
import { isNotDefined } from 'utils'
import { EditableTypebotName } from './EditableTypebotName'
import { getBubbleActions } from 'typebot-js'
import Link from 'next/link'
import { isCloudProdInstance } from '@/utils/helpers'
import { headerHeight } from '../../constants'
import { EditableEmojiOrImageIcon } from '@/components/EditableEmojiOrImageIcon'
import { PublishButton } from '@/features/publish'
import { CollaborationMenuButton } from '@/features/collaboration'

export const TypebotHeader = () => {
  const router = useRouter()
  const {
    typebot,
    updateTypebot,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    isSavingLoading,
  } = useTypebot()
  const { setRightPanel, rightPanel, setStartPreviewAtGroup } = useEditor()

  const handleNameSubmit = (name: string) => updateTypebot({ name })

  const handleChangeIcon = (icon: string) => updateTypebot({ icon })

  const handlePreviewClick = async () => {
    setStartPreviewAtGroup(undefined)
    save().then()
    setRightPanel(RightPanel.PREVIEW)
  }

  const handleHelpClick = () => {
    isCloudProdInstance()
      ? getBubbleActions().open()
      : window.open('https://docs.typebot.io', '_blank')
  }

  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      zIndex={100}
      pos="relative"
      bgColor="white"
      flexShrink={0}
    >
      <HStack
        display={['none', 'flex']}
        pos={{ base: 'absolute', xl: 'static' }}
        right={{ base: 280, xl: 0 }}
      >
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/edit`}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
          size="sm"
        >
          Flow
        </Button>
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/theme`}
          colorScheme={router.pathname.endsWith('theme') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
          size="sm"
        >
          Theme
        </Button>
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/settings`}
          colorScheme={router.pathname.endsWith('settings') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
          size="sm"
        >
          Settings
        </Button>
        <Button
          as={Link}
          href={`/typebots/${typebot?.id}/share`}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
          size="sm"
        >
          Share
        </Button>
        {typebot?.publishedTypebotId && (
          <Button
            as={Link}
            href={`/typebots/${typebot?.id}/results`}
            colorScheme={router.pathname.includes('results') ? 'blue' : 'gray'}
            variant={router.pathname.includes('results') ? 'outline' : 'ghost'}
            size="sm"
          >
            Results
          </Button>
        )}
      </HStack>
      <HStack
        pos="absolute"
        left="1rem"
        justify="center"
        align="center"
        spacing="6"
      >
        <HStack alignItems="center" spacing={3}>
          <IconButton
            as={Link}
            aria-label="Navigate back"
            icon={<ChevronLeftIcon fontSize={25} />}
            href={
              router.query.parentId
                ? `/typebots/${router.query.parentId}/edit`
                : typebot?.folderId
                ? `/typebots/folders/${typebot.folderId}`
                : '/typebots'
            }
            size="sm"
          />
          <HStack spacing={1}>
            {typebot && (
              <EditableEmojiOrImageIcon
                uploadFilePath={`typebots/${typebot.id}/icon`}
                icon={typebot?.icon}
                onChangeIcon={handleChangeIcon}
              />
            )}
            {typebot?.name && (
              <EditableTypebotName
                key={typebot.name}
                defaultName={typebot.name}
                onNewName={handleNameSubmit}
              />
            )}
          </HStack>

          <HStack>
            <Tooltip label="Undo">
              <IconButton
                display={['none', 'flex']}
                icon={<UndoIcon />}
                size="sm"
                aria-label="Undo"
                onClick={undo}
                isDisabled={!canUndo}
              />
            </Tooltip>

            <Tooltip label="Redo">
              <IconButton
                display={['none', 'flex']}
                icon={<RedoIcon />}
                size="sm"
                aria-label="Redo"
                onClick={redo}
                isDisabled={!canRedo}
              />
            </Tooltip>
          </HStack>
          <Button leftIcon={<BuoyIcon />} onClick={handleHelpClick} size="sm">
            Help
          </Button>
        </HStack>
        {isSavingLoading && (
          <HStack>
            <Spinner speed="0.7s" size="sm" color="gray.400" />
            <Text fontSize="sm" color="gray.400">
              Saving...
            </Text>
          </HStack>
        )}
      </HStack>

      <HStack right="40px" pos="absolute" display={['none', 'flex']}>
        <CollaborationMenuButton isLoading={isNotDefined(typebot)} />
        {router.pathname.includes('/edit') && isNotDefined(rightPanel) && (
          <Button
            onClick={handlePreviewClick}
            isLoading={isNotDefined(typebot)}
            size="sm"
          >
            Preview
          </Button>
        )}
        <PublishButton size="sm" />
      </HStack>
    </Flex>
  )
}
