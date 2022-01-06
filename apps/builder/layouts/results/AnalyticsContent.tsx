import { Flex, useToast } from '@chakra-ui/react'
import AnalyticsGraph from 'components/analytics/graph/AnalyticsGraph'
import { StatsCards } from 'components/analytics/StatsCards'
import { AnalyticsGraphProvider } from 'contexts/AnalyticsGraphProvider'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { Stats } from 'models'
import React from 'react'
import { useAnswersCount } from 'services/analytics'

export const AnalyticsContent = ({ stats }: { stats?: Stats }) => {
  const { typebot, publishedTypebot } = useTypebot()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const { answersCounts } = useAnswersCount({
    typebotId: typebot?.id,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })
  return (
    <Flex
      w="full"
      pos="relative"
      bgColor="gray.50"
      h="full"
      justifyContent="center"
    >
      {publishedTypebot && (
        <AnalyticsGraphProvider initialTypebot={publishedTypebot}>
          <AnalyticsGraph
            flex="1"
            answersCounts={[
              { blockId: 'start-block', totalAnswers: stats?.totalViews ?? 0 },
              ...(answersCounts ?? []),
            ]}
          />
        </AnalyticsGraphProvider>
      )}
      <StatsCards stats={stats} pos="absolute" top={10} />
    </Flex>
  )
}
