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
        <Text h={'auto'} ml={'8px'}>
          Clique para editar...
        </Text>
      )}
      {selectedBot && (
        <Stack>
          <Text h={'auto'} ml={'8px'}>
            Passar conversa para o bot
          </Text>

          <chakra.span
            bgColor="#5699EA"
            color="white"
            rounded="md"
            py="0.5"
            px="1"
          >
            {selectedBot.name}
          </chakra.span>
        </Stack>
      )}

    </Stack>
  )
}
