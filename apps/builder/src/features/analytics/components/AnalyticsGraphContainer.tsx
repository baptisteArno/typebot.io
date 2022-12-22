import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useToast } from '@/hooks/useToast'
import { useTypebot } from '@/features/editor'
import { Stats } from 'models'
import React from 'react'
import { useAnswersCount } from '../hooks/useAnswersCount'
import {
  Graph,
  GraphProvider,
  GroupsCoordinatesProvider,
} from '@/features/graph'
import { ChangePlanModal, LimitReached } from '@/features/billing'
import { StatsCards } from './StatsCards'

export const AnalyticsGraphContainer = ({ stats }: { stats?: Stats }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { typebot, publishedTypebot } = useTypebot()
  const { showToast } = useToast()
  const { answersCounts } = useAnswersCount({
    typebotId: publishedTypebot && typebot?.id,
    onError: (err) => showToast({ title: err.name, description: err.message }),
  })
  return (
    <Flex
      w="full"
      pos="relative"
      bgColor={useColorModeValue('white', 'gray.850')}
      backgroundImage={useColorModeValue(
        'radial-gradient(#c6d0e1 1px, transparent 0)',
        'radial-gradient(#2f2f39 1px, transparent 0)'
      )}
      backgroundSize="40px 40px"
      backgroundPosition="-19px -19px"
      h="full"
      justifyContent="center"
    >
      {publishedTypebot && answersCounts && stats ? (
        <GraphProvider isReadOnly>
          <GroupsCoordinatesProvider groups={publishedTypebot?.groups}>
            <Graph
              flex="1"
              typebot={publishedTypebot}
              onUnlockProPlanClick={onOpen}
              answersCounts={
                answersCounts
                  ? [
                      { ...answersCounts[0], totalAnswers: stats?.totalStarts },
                      ...answersCounts.slice(1),
                    ]
                  : []
              }
            />
          </GroupsCoordinatesProvider>
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
        type={LimitReached.ANALYTICS}
      />
      <StatsCards stats={stats} pos="absolute" top={10} />
    </Flex>
  )
}
