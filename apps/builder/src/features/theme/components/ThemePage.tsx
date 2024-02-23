import { Seo } from '@/components/Seo'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@typebot.io/nextjs'
import { ThemeSideMenu } from './ThemeSideMenu'
import { TypebotNotFoundPage } from '@/features/editor/components/TypebotNotFoundPage'
import { headerHeight } from '@/features/editor/constants'

export const ThemePage = () => {
  const { typebot, is404 } = useTypebot()

  if (is404) return <TypebotNotFoundPage />
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={typebot?.name ? `${typebot.name} | Theme` : 'Theme'} />
      <TypebotHeader />
      <Flex w="full" height={`calc(100vh - ${headerHeight}px)`}>
        <ThemeSideMenu />
        <Flex flex="1">
          {typebot && (
            <Standard
              typebot={typebot}
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
