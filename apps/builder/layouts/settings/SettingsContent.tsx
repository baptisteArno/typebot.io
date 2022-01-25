import { Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useMemo } from 'react'
import { TypebotViewer } from 'bot-engine'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { SettingsSideMenu } from 'components/settings/SettingsSideMenu'

export const SettingsContent = () => {
  const { typebot } = useTypebot()
  const publicTypebot = useMemo(
    () => (typebot ? parseTypebotToPublicTypebot(typebot) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typebot?.settings]
  )

  return (
    <Flex h="full" w="full">
      <SettingsSideMenu />
      <Flex flex="1">
        {publicTypebot && <TypebotViewer typebot={publicTypebot} />}
      </Flex>
    </Flex>
  )
}
