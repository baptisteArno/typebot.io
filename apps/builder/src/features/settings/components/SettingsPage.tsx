import { Seo } from '@/components/Seo'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@typebot.io/nextjs'
import { SettingsSideMenu } from './SettingsSideMenu'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { TypebotNotFoundPage } from '@/features/editor/components/TypebotNotFoundPage'
import { env } from '@typebot.io/env'
import { headerHeight } from '@/features/editor/constants'

export const SettingsPage = () => {
  const { typebot, is404 } = useTypebot()

  if (is404) return <TypebotNotFoundPage />
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={typebot?.name ? `${typebot.name} | Settings` : 'Settings'} />
      <TypebotHeader />
      <Flex height={`calc(100vh - ${headerHeight}px)`} w="full">
        <SettingsSideMenu />
        <Flex flex="1">
          {typebot && (
            <Standard
              apiHost={env.NEXT_PUBLIC_VIEWER_URL[0]}
              typebot={typebot}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
