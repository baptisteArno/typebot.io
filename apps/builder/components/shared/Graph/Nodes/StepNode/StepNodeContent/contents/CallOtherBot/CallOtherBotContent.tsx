import React from 'react'
import { CallOtherBotOptions, CallOtherBotStep } from 'models'
import { useTypebot } from 'contexts/TypebotContext'
import { Stack, Text, chakra } from '@chakra-ui/react'

type Props = {
  options: CallOtherBotOptions
  step: CallOtherBotStep
}

export const CallOtherBotContent = ({ options }: Props) => {
  const { botFluxesList } = useTypebot()
  const selectedBot = botFluxesList?.filter((item) => item.id === options)[0]

  return (
    <Stack>
      {!selectedBot && (
        <Text color={'gray.500'} h={'auto'} ml={'8px'}>
          Configurar...
        </Text>
      )}
      {selectedBot && (
        <Text color={'gray.500'} h={'auto'} ml={'8px'}>
          Chamar o bot{' '}
          {selectedBot && (
            <chakra.span
              bgColor="#5699EA"
              color="white"
              rounded="md"
              py="0.5"
              px="1"
            >
              {selectedBot.name}
            </chakra.span>
          )}
        </Text>
      )}
    </Stack>
  )
}
