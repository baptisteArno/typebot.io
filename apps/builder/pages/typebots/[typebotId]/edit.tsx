import { Flex } from '@chakra-ui/layout'
import { Board } from 'components/board/Board'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { EditorContext } from 'contexts/EditorContext'
import { KBarProvider } from 'kbar'
import React from 'react'
import { actions } from 'libs/kbar'
import { KBar } from 'components/shared/KBar'

const TypebotEditPage = () => (
  <EditorContext>
    <Seo title="Editor" />
    <KBarProvider actions={actions}>
      <KBar />
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <TypebotHeader />
        <Board />
      </Flex>
    </KBarProvider>
  </EditorContext>
)
export default TypebotEditPage
