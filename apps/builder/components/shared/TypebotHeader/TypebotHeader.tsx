import { Flex, HStack, Button, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'
import { PublishButton } from '../buttons/PublishButton'
import { EditableTypebotName } from './EditableTypebotName'
import { SaveButton } from './SaveButton'

export const headerHeight = 56

export const TypebotHeader = () => {
  const router = useRouter()
  const { typebot, updateTypebot, save } = useTypebot()
  const { setRightPanel } = useEditor()

  const handleBackClick = () => {
    router.push({
      pathname: `/typebots`,
      query: { ...router.query, typebotId: [] },
    })
  }

  const handleNameSubmit = (name: string) => updateTypebot({ name })

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
        <Button
          as={NextChakraLink}
          href={`/typebots/${typebot?.id}/results`}
          colorScheme={router.pathname.includes('results') ? 'blue' : 'gray'}
          variant={router.pathname.includes('results') ? 'outline' : 'ghost'}
        >
          Results
        </Button>
      </HStack>
      <Flex pos="absolute" left="1rem" justify="center" align="center">
        <Flex alignItems="center">
          <IconButton
            aria-label="Back"
            icon={<ChevronLeftIcon fontSize={30} />}
            mr={2}
            onClick={handleBackClick}
          />
          <EditableTypebotName
            name={typebot?.name}
            onNewName={handleNameSubmit}
          />
        </Flex>
      </Flex>

      <HStack right="40px" pos="absolute">
        <SaveButton />
        <Button onClick={handlePreviewClick}>Preview</Button>
        <PublishButton />
      </HStack>
    </Flex>
  )
}
