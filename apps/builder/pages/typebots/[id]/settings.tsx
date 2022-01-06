import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { SettingsContent } from 'components/settings/SettingsContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { TypebotContext } from 'contexts/TypebotContext/TypebotContext'
import { UserContext } from 'contexts/UserContext'
import { useRouter } from 'next/router'
import React from 'react'

const SettingsPage = () => {
  const { query } = useRouter()
  return (
    <UserContext>
      <TypebotContext typebotId={query.id?.toString()}>
        <Seo title="Settings" />
        <Flex overflow="hidden" h="100vh" flexDir="column">
          <TypebotHeader />
          <SettingsContent />
        </Flex>
      </TypebotContext>
    </UserContext>
  )
}

export default SettingsPage
