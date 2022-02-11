import { Flex, useToast } from '@chakra-ui/react'
import { StatsCards } from 'components/analytics/StatsCards'
import { Graph } from 'components/shared/Graph'
import { GraphProvider } from 'contexts/GraphContext'
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
      {publishedTypebot && answersCounts && stats && (
        <GraphProvider blocks={publishedTypebot?.blocks ?? []} isReadOnly>
          <Graph
            flex="1"
            typebot={publishedTypebot}
            answersCounts={[
              { ...answersCounts[0], totalAnswers: stats?.totalStarts },
              ...answersCounts?.slice(1),
            ]}
          />
        </GraphProvider>
      )}
      <StatsCards stats={stats} pos="absolute" top={10} />
    </Flex>
  )
}
