import { Flex } from '@chakra-ui/layout'
import withAuth from 'components/HOC/withUser'
import { ResultsContent } from 'layouts/results/ResultsContent'
import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React from 'react'

const AnalyticsPage = () => {
  const { query } = useRouter()
  return (
    <TypebotContext typebotId={query.id?.toString()}>
      <Seo title="Analytics" />
      <Flex overflow="hidden" h="100vh" flexDir="column">
        <TypebotHeader />
        <ResultsContent />
      </Flex>
    </TypebotContext>
  )
}

export default withAuth(AnalyticsPage)
