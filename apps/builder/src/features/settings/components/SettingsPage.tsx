import { Seo } from '@/components/Seo'
import { TypebotHeader, useTypebot } from '@/features/editor'
import { Flex } from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useMemo } from 'react'
import { getViewerUrl } from 'utils'
import { SettingsSideMenu } from './SettingsSideMenu'
import { parseTypebotToPublicTypebot } from '@/features/publish'

export const SettingsPage = () => {
  const { typebot } = useTypebot()
  const publicTypebot = useMemo(
    () => (typebot ? parseTypebotToPublicTypebot(typebot) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typebot?.settings]
  )

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title="Settings" />
      <TypebotHeader />
      <Flex h="full" w="full">
        <SettingsSideMenu />
        <Flex flex="1">
          {publicTypebot && (
            <TypebotViewer
              apiHost={getViewerUrl({ isBuilder: true })}
              typebot={publicTypebot}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
