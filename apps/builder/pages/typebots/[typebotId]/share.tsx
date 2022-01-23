import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { ShareContent } from 'components/share/ShareContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import React from 'react'

const SharePage = () => (
  <Flex overflow="hidden" h="100vh" flexDir="column">
    <Seo title="Share" />
    <TypebotHeader />
    <ShareContent />
  </Flex>
)

export default SharePage
