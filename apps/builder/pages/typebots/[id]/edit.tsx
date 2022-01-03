import { Flex } from '@chakra-ui/layout'
import { Board } from 'components/board/Board'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { EditorContext } from 'contexts/EditorContext'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import { KBarProvider } from 'kbar'
import React from 'react'
import { actions } from 'libs/kbar'
import { KBar } from 'components/shared/KBar'
import { UserContext } from 'contexts/UserContext'

const TypebotEditPage = () => {
  const { query } = useRouter()
  return (
    <UserContext>
      <TypebotContext typebotId={query.id?.toString()}>
        <Seo title="Editor" />
        <EditorContext>
          <KBarProvider actions={actions}>
            <KBar />
            <Flex overflow="hidden" h="100vh" flexDir="column">
              <TypebotHeader />
              <Board />
            </Flex>
          </KBarProvider>
        </EditorContext>
      </TypebotContext>
    </UserContext>
  )
}

export default TypebotEditPage
