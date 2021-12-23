import { Flex } from '@chakra-ui/layout'
import { Board } from 'components/board/Board'
import withAuth from 'components/HOC/withUser'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { EditorContext } from 'contexts/EditorContext'
import { GraphProvider } from 'contexts/GraphContext'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import { KBarProvider } from 'kbar'
import React from 'react'
import { actions } from 'libs/kbar'
import { KBar } from 'components/shared/KBar'

const TypebotEditPage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Editor" />
      <EditorContext>
        <KBarProvider actions={actions}>
          <KBar />
          <Flex overflow="hidden" h="100vh" flexDir="column">
            <TypebotHeader />
            <GraphProvider>
              <Board />
            </GraphProvider>
          </Flex>
        </KBarProvider>
      </EditorContext>
    </TypebotContext>
  )
}

export default withAuth(TypebotEditPage)
