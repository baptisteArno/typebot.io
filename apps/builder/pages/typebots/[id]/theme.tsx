import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { ThemeContent } from 'components/theme/ThemeContent'
import { TypebotContext } from 'contexts/TypebotContext/TypebotContext'
import { UserContext } from 'contexts/UserContext'
import { useRouter } from 'next/router'
import React from 'react'

const ThemePage = () => {
  const { query } = useRouter()
  return (
    <UserContext>
      <TypebotContext typebotId={query.id?.toString()}>
        <Seo title="Theme" />
        <Flex overflow="hidden" h="100vh" flexDir="column">
          <TypebotHeader />
          <ThemeContent />
        </Flex>
      </TypebotContext>
    </UserContext>
  )
}

export default ThemePage
