import { Seo } from '@/components/Seo'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Flex } from '@chakra-ui/react'
import { Standard } from '@typebot.io/react'
import { ThemeSideMenu } from './ThemeSideMenu'

export const ThemePage = () => {
  const { typebot } = useTypebot()

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={typebot?.name ? `${typebot.name} | Theme` : 'Theme'} />
      <TypebotHeader />
      <Flex h="full" w="full">
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
