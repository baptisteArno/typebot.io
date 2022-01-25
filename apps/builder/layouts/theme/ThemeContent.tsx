import { Flex } from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useMemo } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { ThemeSideMenu } from '../../components/theme/ThemeSideMenu'

export const ThemeContent = () => {
  const { typebot } = useTypebot()
  const publicTypebot = useMemo(
    () => (typebot ? parseTypebotToPublicTypebot(typebot) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typebot?.theme]
  )
  return (
    <Flex h="full" w="full">
      <ThemeSideMenu />
      <Flex flex="1">
        {publicTypebot && <TypebotViewer typebot={publicTypebot} />}
      </Flex>
    </Flex>
  )
}
