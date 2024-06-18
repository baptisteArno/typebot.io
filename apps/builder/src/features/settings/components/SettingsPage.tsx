import { Seo } from '@/components/Seo'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@sniper.io/nextjs'
import { SettingsSideMenu } from './SettingsSideMenu'
import { SniperHeader } from '@/features/editor/components/SniperHeader'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { SniperNotFoundPage } from '@/features/editor/components/SniperNotFoundPage'
import { env } from '@sniper.io/env'
import { headerHeight } from '@/features/editor/constants'

export const SettingsPage = () => {
  const { sniper, is404 } = useSniper()

  if (is404) return <SniperNotFoundPage />
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={sniper?.name ? `${sniper.name} | Settings` : 'Settings'} />
      <SniperHeader />
      <Flex height={`calc(100vh - ${headerHeight}px)`} w="full">
        <SettingsSideMenu />
        <Flex flex="1">
          {sniper && (
            <Standard apiHost={env.NEXT_PUBLIC_VIEWER_URL[0]} sniper={sniper} />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
