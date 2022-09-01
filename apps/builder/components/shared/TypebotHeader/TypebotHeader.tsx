import {
  Flex,
  HStack,
  Button,
  IconButton,
  Tooltip,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { ChevronLeftIcon, RedoIcon, UndoIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'
import { isNotDefined } from 'utils'
import { PublishButton } from '../buttons/PublishButton'
import { EditableEmojiOrImageIcon } from '../EditableEmojiOrImageIcon'
import { CollaborationMenuButton } from './CollaborationMenuButton'
import { EditableTypebotName } from './EditableTypebotName'

export const headerHeight = 56

export const TypebotHeader = () => {
  const router = useRouter()
  const { rightPanel } = useEditor()
  const {
    typebot,
    updateOnBothTypebots,
    updateTypebot,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    isSavingLoading,
  } = useTypebot()
  const { setRightPanel } = useEditor()

  const handleNameSubmit = (name: string) => updateOnBothTypebots({ name })

  const handleChangeIcon = (icon: string) => updateTypebot({ icon })

  const handlePreviewClick = async () => {
    save().then()
    setRightPanel(RightPanel.PREVIEW)
  }

  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      pos="relative"
      h={`${headerHeight}px`}
      zIndex={100}
      bgColor="white"
      flexShrink={0}
    >
      <HStack display={['none', 'flex']}>
        <Button
          as={NextChakraLink}
          href={`/embed/builder/typebots/${typebot?.id}/edit`}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
        >
          Flow
        </Button>
        <Button
          as={NextChakraLink}
          href={`/embed/builder/typebots/${typebot?.id}/theme`}
          colorScheme={router.pathname.endsWith('theme') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
        >
          Theme
        </Button>
        <Button
          as={NextChakraLink}
          href={`/embed/builder/typebots/${typebot?.id}/settings`}
          colorScheme={router.pathname.endsWith('settings') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
        >
          Settings
        </Button>
        <Button
          as={NextChakraLink}
          href={`/embed/builder/typebots/${typebot?.id}/share`}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        >
          Share
        </Button>
        {typebot?.publishedTypebotId && (
          <Button
            as={NextChakraLink}
            href={`/embed/builder/typebots/${typebot?.id}/results`}
            colorScheme={router.pathname.includes('results') ? 'blue' : 'gray'}
            variant={router.pathname.includes('results') ? 'outline' : 'ghost'}
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
        <HStack alignItems="center" spacing={4}>
          <IconButton
            as={NextChakraLink}
            aria-label="Navigate back"
            icon={<ChevronLeftIcon fontSize={30} />}
            href={
              router.query.parentId
                ? `/embed/builder/typebots/${router.query.parentId}/edit`
                : typebot?.folderId
                ? `/embed/builder/typebots/folders/${typebot.folderId}`
                : '/embed/builder/typebots'
            }
          />
          <HStack spacing={1}>
            <EditableEmojiOrImageIcon
              icon={typebot?.icon}
              onChangeIcon={handleChangeIcon}
            />
            {typebot?.name && (
              <EditableTypebotName
                name={typebot?.name}
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
        <CollaborationMenuButton />
        {router.pathname.includes('/edit') && isNotDefined(rightPanel) && (
          <Button onClick={handlePreviewClick}>Preview</Button>
        )}
        <PublishButton />
      </HStack>
    </Flex>
  )
}
