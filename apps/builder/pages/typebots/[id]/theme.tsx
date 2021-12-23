import { Flex } from '@chakra-ui/layout'
import withAuth from 'components/HOC/withUser'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { ThemeContent } from 'components/theme/ThemeContent'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'

const ThemePage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Theme" />
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <TypebotHeader />
        <ThemeContent />
      </Flex>
    </TypebotContext>
  )
}

export default withAuth(ThemePage)
