import { Seo } from '@/components/Seo'
import { TypebotHeader, useTypebot } from '@/features/editor'
import { Flex } from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { getViewerUrl } from 'utils'
import { ThemeSideMenu } from './ThemeSideMenu'
import { parseTypebotToPublicTypebot } from '@/features/publish'

export const ThemePage = () => {
  const { typebot } = useTypebot()
  const publicTypebot = typebot && parseTypebotToPublicTypebot(typebot)

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title="Theme" />
      <TypebotHeader />
      <Flex h="full" w="full">
        <ThemeSideMenu />
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
