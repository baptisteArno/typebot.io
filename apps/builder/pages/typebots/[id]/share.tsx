import { Flex } from '@chakra-ui/layout'
import withAuth from 'components/HOC/withUser'
import { Seo } from 'components/Seo'
import { ShareContent } from 'components/share/ShareContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'

const SharePage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Share" />
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <TypebotHeader />
        <ShareContent />
      </Flex>
    </TypebotContext>
  )
}

export default withAuth(SharePage)
