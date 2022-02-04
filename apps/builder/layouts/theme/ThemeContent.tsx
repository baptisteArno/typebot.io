import { Flex } from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { ThemeSideMenu } from '../../components/theme/ThemeSideMenu'

export const ThemeContent = () => {
  const { typebot } = useTypebot()
  const publicTypebot = typebot && parseTypebotToPublicTypebot(typebot)
  return (
    <Flex h="full" w="full">
      <ThemeSideMenu />
      <Flex flex="1">
        {publicTypebot && <TypebotViewer typebot={publicTypebot} />}
      </Flex>
    </Flex>
  )
}
