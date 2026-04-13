import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stats } from '@typebot.io/schemas'
import React, { useMemo, useState } from 'react'
import { CxMetricsPanel } from './CxMetricsPanel'
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

export type GroupAnalytics = {
  groupId: string
  visits: number
  visitPercentage: number
}

export type BlockIssue = {
  blockId: string
  groupId: string
  type: 'abandoned' | 'error'
  count: number
  percentage: number
}

export const AnalyticsGraphContainer = ({
  timeFilter,
  onTimeFilterChange,
  stats,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { typebot, publishedTypebot } = useTypebot()

  const { data: blockVisitData } = trpc.analytics.getBlockVisitStats.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(typebot?.id) }
  )

  const groupAnalyticsMap = useMemo(() => {
    if (!blockVisitData?.groupStats) return undefined
    const map = new Map<string, GroupAnalytics>()
    for (const gs of blockVisitData.groupStats) {
      map.set(gs.groupId, gs)
    }
    return map
  }, [blockVisitData?.groupStats])

  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true)

  const graphBgColor = useColorModeValue('#f4f5f8', 'gray.850')
  const graphBgImage = useColorModeValue(
    'radial-gradient(#c6d0e1 1px, transparent 0)',
    'radial-gradient(#2f2f39 1px, transparent 0)'
  )

  return (
    <Flex w="full" direction="column" h="full" overflow="hidden">
      <CxMetricsPanel
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
        isExpanded={isMetricsExpanded}
        onToggle={() => setIsMetricsExpanded((prev) => !prev)}
      />
      <Flex
        w="full"
        pos="relative"
        bgColor={graphBgColor}
        backgroundImage={graphBgImage}
        backgroundSize="40px 40px"
        backgroundPosition="-19px -19px"
        flex="1"
        minH="0"
        justifyContent="center"
        overflow="hidden"
      >
        {publishedTypebot ? (
          <GraphProvider isReadOnly isAnalytics>
            <EventsCoordinatesProvider events={publishedTypebot?.events}>
              <Graph
                flex="1"
                typebot={publishedTypebot}
                onUnlockProPlanClick={onOpen}
                groupAnalyticsMap={groupAnalyticsMap}
                blockIssues={blockVisitData?.blockIssues}
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
      </Flex>
    </Flex>
  )
}
