import { Flex, HStack, Button, IconButton } from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useTypebot } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'
import { PublishButton } from '../buttons/PublishButton'
import { EditableTypebotName } from './EditableTypebotName'
import { SaveButton } from './SaveButton'

export const headerHeight = 56

export const TypebotHeader = () => {
  const router = useRouter()
  const { typebot } = useTypebot()
  const { setRightPanel } = useEditor()

  const handleBackClick = () => {
    router.push({
      pathname: `/typebots`,
      query: { ...router.query, typebotId: [] },
    })
  }

  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      pos="fixed"
      h={`${headerHeight}px`}
      zIndex={2}
      bgColor="white"
    >
      <HStack>
        <Button
          as={NextChakraLink}
          href={{
            pathname: `/typebots/${typebot?.id}/edit`,
            query: { ...router.query, typebotId: [] },
          }}
          colorScheme={router.pathname.includes('/edit') ? 'blue' : 'gray'}
          variant={router.pathname.includes('/edit') ? 'outline' : 'ghost'}
        >
          Flow
        </Button>
        <Button
          as={NextChakraLink}
          href={{
            pathname: `/typebots/${typebot?.id}/design`,
            query: { ...router.query, typebotId: [] },
          }}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        >
          Theme
        </Button>
        <Button
          as={NextChakraLink}
          href={{
            pathname: `/typebots/${typebot?.id}/design`,
            query: { ...router.query, typebotId: [] },
          }}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        >
          Settings
        </Button>
        <Button
          as={NextChakraLink}
          href={{
            pathname: `/typebots/${typebot?.id}/share`,
            query: { ...router.query, typebotId: [] },
          }}
          colorScheme={router.pathname.endsWith('share') ? 'blue' : 'gray'}
          variant={router.pathname.endsWith('share') ? 'outline' : 'ghost'}
        >
          Share
        </Button>
        <Button
          as={NextChakraLink}
          href={{
            pathname: `/typebots/${typebot?.id}/results/responses`,
            query: { ...router.query, typebotId: [] },
          }}
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
            onNewName={(newName) => console.log(newName)}
          />
        </Flex>
      </Flex>

      <HStack right="40px" pos="absolute">
        <SaveButton />
        <Button
          onClick={() => {
            setRightPanel(RightPanel.PREVIEW)
          }}
        >
          Preview
        </Button>

        <PublishButton />
      </HStack>
    </Flex>
  )
}
