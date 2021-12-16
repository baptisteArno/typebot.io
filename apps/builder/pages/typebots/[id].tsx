import { Flex } from '@chakra-ui/layout'
import { Board } from 'components/board/Board'
import withAuth from 'components/HOC/withUser'
import { Seo } from 'components/Seo'
import { GraphProvider } from 'contexts/GraphContext'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'

const TypebotEditPage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Editor" />
      <Flex overflow="hidden" h="100vh">
        <GraphProvider>
          <Board />
        </GraphProvider>
      </Flex>
    </TypebotContext>
  )
}

export default withAuth(TypebotEditPage)
