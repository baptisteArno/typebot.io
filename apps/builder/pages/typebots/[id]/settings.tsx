import { Flex } from '@chakra-ui/layout'
import withAuth from 'components/HOC/withUser'
import { Seo } from 'components/Seo'
import { SettingsContent } from 'components/settings/SettingsContent'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'

const SettingsPage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Settings" />
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <TypebotHeader />
        <SettingsContent />
      </Flex>
    </TypebotContext>
  )
}

export default withAuth(SettingsPage)
