import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { GraphProvider } from 'contexts/BoardContext'
import React from 'react'

const TypebotEditPage = () => {
  return (
    <>
      <Seo title="Editor" />
      <Flex overflow="hidden" h="100vh">
        <GraphProvider>
          <></>
        </GraphProvider>
      </Flex>
    </>
  )
}

export default TypebotEditPage
