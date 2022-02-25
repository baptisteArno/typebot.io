import { Flex } from '@chakra-ui/layout'
import { Board } from 'layouts/editor/Board'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { EditorContext } from 'contexts/EditorContext'
import React from 'react'
import { KBar } from 'components/shared/KBar'

const TypebotEditPage = () => (
  <EditorContext>
    <Seo title="Editor" />
    <KBar />
    <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
      <TypebotHeader />
      <Board />
    </Flex>
  </EditorContext>
)
export default TypebotEditPage
