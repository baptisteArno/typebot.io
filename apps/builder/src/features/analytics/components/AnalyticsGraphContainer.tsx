import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stats } from '@typebot.io/schemas'
import React from 'react'
import { StatsCards } from './StatsCards'
import { ChangePlanModal } from '@/features/billing/components/ChangePlanModal'
import { Graph } from '@/features/graph/components/Graph'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@typebot.io/lib'
import { EventsCoordinatesProvider } from '@/features/graph/providers/EventsCoordinateProvider'
import { timeFilterValues } from '../constants'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

type Props = {
  timeFilter: (typeof timeFilterValues)[number]
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void
  stats?: Stats
}

export const AnalyticsGraphContainer = ({
  timeFilter,
  onTimeFilterChange,
  stats,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { typebot, publishedTypebot } = useTypebot()
  const { data } = trpc.analytics.getTotalAnswers.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(publishedTypebot) }
  )

  const { data: edgesData } = trpc.analytics.getTotalVisitedEdges.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(publishedTypebot) }
  )

  return (
    <Flex
      w="full"
      pos="relative"
      bgColor={useColorModeValue('#f4f5f8', 'gray.850')}
      backgroundImage={useColorModeValue(
        'radial-gradient(#c6d0e1 1px, transparent 0)',
        'radial-gradient(#2f2f39 1px, transparent 0)'
      )}
      backgroundSize="40px 40px"
      backgroundPosition="-19px -19px"
      h="full"
      justifyContent="center"
    >
      {publishedTypebot && stats ? (
        <GraphProvider isReadOnly isAnalytics>
          <EventsCoordinatesProvider events={publishedTypebot?.events}>
            <Graph
              flex="1"
              typebot={publishedTypebot}
              onUnlockProPlanClick={onOpen}
              totalAnswers={data?.totalAnswers}
              totalVisitedEdges={edgesData?.totalVisitedEdges}
            />
          </EventsCoordinatesProvider>
        </GraphProvider>
      ) : (
        <Flex
          justify="center"
          align="center"
          boxSize="full"
          bgColor="rgba(255, 255, 255, 0.5)"
        >
          <Spinner color="gray" />
        </Flex>
      )}
      <ChangePlanModal
        onClose={onClose}
        isOpen={isOpen}
        type={t('billing.limitMessage.analytics')}
        excludedPlans={['STARTER']}
      />
      <StatsCards
        stats={stats}
        pos="absolute"
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
      />
    </Flex>
  )
}
