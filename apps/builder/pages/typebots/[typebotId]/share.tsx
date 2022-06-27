import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { ShareContent } from 'components/share/ShareContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import React from 'react'

const SharePage = () => (
  <Flex flexDir="column" pb="40">
    <Seo title="Share" />
    {/* <TypebotHeader /> */}
    <ShareContent />
  </Flex>
)

export default SharePage
