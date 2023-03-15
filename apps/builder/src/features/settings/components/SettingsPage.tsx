import { Seo } from '@/components/Seo'
import { TypebotHeader, useTypebot } from '@/features/editor'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@typebot.io/react'
import { getViewerUrl } from '@typebot.io/lib'
import { SettingsSideMenu } from './SettingsSideMenu'

export const SettingsPage = () => {
  const { typebot } = useTypebot()

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={typebot?.name ? `${typebot.name} | Settings` : 'Settings'} />
      <TypebotHeader />
      <Flex h="full" w="full">
        <SettingsSideMenu />
        <Flex flex="1">
          {typebot && <Standard apiHost={getViewerUrl()} typebot={typebot} />}
        </Flex>
      </Flex>
    </Flex>
  )
}
