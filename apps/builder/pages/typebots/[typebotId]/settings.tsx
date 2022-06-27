import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { SettingsContent } from 'layouts/settings/SettingsContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import React from 'react'

const SettingsPage = () => (
  <Flex overflow="hidden" h="100vh" flexDir="column">
    <Seo title="Settings" />
    {/* <TypebotHeader /> */}
    <SettingsContent />
  </Flex>
)

export default SettingsPage
