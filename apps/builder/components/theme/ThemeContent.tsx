import { Flex } from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useMemo } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { SideMenu } from './SideMenu'

export const ThemeContent = () => {
  const { typebot } = useTypebot()
  const publicTypebot = useMemo(
    () => (typebot ? parseTypebotToPublicTypebot(typebot) : undefined),
    [typebot]
  )
  return (
    <Flex h="full" w="full">
      <SideMenu />
      <Flex flex="1">
        {publicTypebot && <TypebotViewer typebot={publicTypebot} />}
      </Flex>
    </Flex>
  )
}
