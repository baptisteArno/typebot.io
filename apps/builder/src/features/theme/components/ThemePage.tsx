import { Seo } from '@/components/Seo'
import { SniperHeader } from '@/features/editor/components/SniperHeader'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@sniper.io/nextjs'
import { ThemeSideMenu } from './ThemeSideMenu'
import { SniperNotFoundPage } from '@/features/editor/components/SniperNotFoundPage'
import { headerHeight } from '@/features/editor/constants'

export const ThemePage = () => {
  const { sniper, is404 } = useSniper()

  if (is404) return <SniperNotFoundPage />
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={sniper?.name ? `${sniper.name} | Theme` : 'Theme'} />
      <SniperHeader />
      <Flex w="full" height={`calc(100vh - ${headerHeight}px)`}>
        <ThemeSideMenu />
        <Flex flex="1">
          {sniper && (
            <Standard
              sniper={sniper}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
