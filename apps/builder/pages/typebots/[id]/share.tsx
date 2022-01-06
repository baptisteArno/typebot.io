import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { ShareContent } from 'components/share/ShareContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { TypebotContext } from 'contexts/TypebotContext/TypebotContext'
import { UserContext } from 'contexts/UserContext'
import { useRouter } from 'next/router'
import React from 'react'

const SharePage = () => {
  const { query } = useRouter()
  return (
    <UserContext>
      <TypebotContext typebotId={query.id?.toString()}>
        <Seo title="Share" />
        <Flex overflow="hidden" h="100vh" flexDir="column">
          <TypebotHeader />
          <ShareContent />
        </Flex>
      </TypebotContext>
    </UserContext>
  )
}

export default SharePage
