import { Button, Flex, Text, VStack } from '@chakra-ui/react'
import { GlobeIcon, ToolIcon } from 'assets/icons'
import { Typebot } from 'bot-engine'

type Props = {
  typebot: Typebot
}

export const TypebotCardOverlay = ({ typebot }: Props) => {
  return (
    <div
      className="sm:mr-6 mb-6 focus:outline-none rounded-lg "
      style={{ width: '225px', height: '270px' }}
    >
      <Button
        display="flex"
        flexDir="column"
        variant="outline"
        w="full"
        h="full"
        whiteSpace="normal"
      >
        <VStack spacing={4}>
          <Flex
            boxSize="45px"
            rounded="full"
            justifyContent="center"
            alignItems="center"
            bgColor={typebot.publishedTypebotId ? 'blue.500' : 'gray.400'}
            color="white"
          >
            {typebot.publishedTypebotId ? (
              <GlobeIcon fill="white" fontSize="20px" />
            ) : (
              <ToolIcon fill="white" fontSize="20px" />
            )}
          </Flex>
          <Text>{typebot.name}</Text>
        </VStack>
      </Button>
    </div>
  )
}
