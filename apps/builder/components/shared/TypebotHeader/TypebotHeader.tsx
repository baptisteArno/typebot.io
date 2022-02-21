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
import { PublishButton } from '../buttons/PublishButton'
import { EditableTypebotName } from './EditableTypebotName'

export const headerHeight = 56

export const TypebotHeader = () => {
  const router = useRouter()
  const {
    typebot,
    updateOnBothTypebots,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    isSavingLoading,
  } = useTypebot()
  const { setRightPanel } = useEditor()

  const handleBackClick = async () => {
    await save()
    router.push({
      pathname: `/typebots`,
      query: { ...router.query, typebotId: [] },
    })
  }

  const handleNameSubmit = (name: string) => updateOnBothTypebots({ name })

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
      zIndex={2}
      bgColor="white"
      flexShrink={0}
    >
      <HStack>
        <Button
          as={NextChakraLink}
          href={`/typebots/${typebot?.id}/edit`}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
        >
          Flow
        </Button>
        <Button
          as={NextChakraLink}
          href={`/typebots/${typebot?.id}/theme`}
          colorScheme={router.pathname.endsWith('theme') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('theme') ? 'outline' : 'ghost'}
        >
          Theme
        </Button>
        <Button
          as={NextChakraLink}
          href={`/typebots/${typebot?.id}/settings`}
          colorScheme={router.pathname.endsWith('settings') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('settings') ? 'outline' : 'ghost'}
        >
          Settings
        </Button>
        <Button
          as={NextChakraLink}
          href={`/typebots/${typebot?.id}/share`}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        >
          Share
        </Button>
        {typebot?.publishedTypebotId && (
          <Button
            as={NextChakraLink}
            href={`/typebots/${typebot?.id}/results`}
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
        <HStack alignItems="center">
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon fontSize={30} />}
            onClick={handleBackClick}
          />
          {typebot?.name && (
            <EditableTypebotName
              name={typebot?.name}
              onNewName={handleNameSubmit}
            />
          )}
          <Tooltip label="Undo">
            <IconButton
              icon={<UndoIcon />}
              size="sm"
              aria-label="Undo"
              onClick={undo}
              isDisabled={!canUndo}
            />
          </Tooltip>

          <Tooltip label="Redo">
            <IconButton
              icon={<RedoIcon />}
              size="sm"
              aria-label="Redo"
              onClick={redo}
              isDisabled={!canRedo}
            />
          </Tooltip>
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

      <HStack right="40px" pos="absolute">
        <Button onClick={handlePreviewClick}>Preview</Button>
        <PublishButton />
      </HStack>
    </Flex>
  )
}
