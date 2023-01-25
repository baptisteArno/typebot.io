import { Seo } from '@/components/Seo'
import { UnlockPlanAlertInfo } from '@/components/UnlockPlanAlertInfo'
import { AnalyticsGraphContainer } from '@/features/analytics'
import { useUsage } from '@/features/billing'
import { useTypebot, TypebotHeader } from '@/features/editor'
import { useWorkspace } from '@/features/workspace'
import { useToast } from '@/hooks/useToast'
import {
  Flex,
  HStack,
  Button,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { getChatsLimit, getStorageLimit } from 'utils/pricing'
import { useStats } from '../hooks/useStats'
import { ResultsProvider } from '../ResultsProvider'
import { ResultsTableContainer } from './ResultsTableContainer'

const ALERT_CHATS_PERCENT_THRESHOLD = 80
const ALERT_STORAGE_PERCENT_THRESHOLD = 80

export const ResultsPage = () => {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { typebot, publishedTypebot } = useTypebot()
  const isAnalytics = useMemo(
    () => router.pathname.endsWith('analytics'),
    [router.pathname]
  )
  const { showToast } = useToast()

  const { stats, mutate } = useStats({
    typebotId: publishedTypebot?.typebotId,
    onError: (err) => showToast({ title: err.name, description: err.message }),
  })
  const { data: usageData } = useUsage(workspace?.id)

  const chatsLimitPercentage = useMemo(() => {
    if (!usageData?.totalChatsUsed || !workspace?.plan) return 0
    return Math.round(
      (usageData.totalChatsUsed /
        getChatsLimit({
          additionalChatsIndex: workspace.additionalChatsIndex,
          plan: workspace.plan,
          customChatsLimit: workspace.customChatsLimit,
        })) *
        100
    )
  }, [
    usageData?.totalChatsUsed,
    workspace?.additionalChatsIndex,
    workspace?.customChatsLimit,
    workspace?.plan,
  ])

  const storageLimitPercentage = useMemo(() => {
    if (!usageData?.totalStorageUsed || !workspace?.plan) return 0
    return Math.round(
      (usageData.totalStorageUsed /
        1024 /
        1024 /
        1024 /
        getStorageLimit({
          additionalStorageIndex: workspace.additionalStorageIndex,
          plan: workspace.plan,
          customStorageLimit: workspace.customStorageLimit,
        })) *
        100
    )
  }, [
    usageData?.totalStorageUsed,
    workspace?.additionalStorageIndex,
    workspace?.customStorageLimit,
    workspace?.plan,
  ])

  const handleDeletedResults = (total: number) => {
    if (!stats) return
    mutate({
      stats: { ...stats, totalStarts: stats.totalStarts - total },
    })
  }

  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo
        title={router.pathname.endsWith('analytics') ? 'Analytics' : 'Results'}
      />
      <TypebotHeader />
      {chatsLimitPercentage > ALERT_CHATS_PERCENT_THRESHOLD && (
        <Flex p="4">
          <UnlockPlanAlertInfo
            status="warning"
            contentLabel={
              <>
                Your workspace collected{' '}
                <strong>{chatsLimitPercentage}%</strong> of your total chats
                limit this month. Upgrade your plan to continue chatting with
                your customers beyond this limit.
              </>
            }
            buttonLabel="Upgrade"
          />
        </Flex>
      )}
      {storageLimitPercentage > ALERT_STORAGE_PERCENT_THRESHOLD && (
        <Flex p="4">
          <UnlockPlanAlertInfo
            status="warning"
            contentLabel={
              <>
                Your workspace collected{' '}
                <strong>{storageLimitPercentage}%</strong> of your total storage
                allowed. Upgrade your plan or delete some existing results to
                continue collecting files from your user beyond this limit.
              </>
            }
            buttonLabel="Upgrade"
          />
        </Flex>
      )}
      <Flex h="full" w="full">
        <Flex
          pos="absolute"
          zIndex={2}
          w="full"
          bg={useColorModeValue('white', 'gray.900')}
          justifyContent="center"
          h="60px"
          display={['none', 'flex']}
        >
          <HStack maxW="1600px" w="full" px="4">
            <Button
              as={Link}
              colorScheme={!isAnalytics ? 'blue' : 'gray'}
              variant={!isAnalytics ? 'outline' : 'ghost'}
              size="sm"
              href={`/typebots/${typebot?.id}/results`}
            >
              <Text>Submissions</Text>
              {(stats?.totalStarts ?? 0) > 0 && (
                <Tag size="sm" colorScheme="blue" ml="1">
                  {stats?.totalStarts}
                </Tag>
              )}
            </Button>
            <Button
              as={Link}
              colorScheme={isAnalytics ? 'blue' : 'gray'}
              variant={isAnalytics ? 'outline' : 'ghost'}
              href={`/typebots/${typebot?.id}/results/analytics`}
              size="sm"
            >
              Analytics
            </Button>
          </HStack>
        </Flex>
        <Flex pt={['10px', '60px']} w="full" justify="center">
          {workspace &&
            publishedTypebot &&
            (isAnalytics ? (
              <AnalyticsGraphContainer stats={stats} />
            ) : (
              <ResultsProvider
                typebotId={publishedTypebot.typebotId}
                totalResults={stats?.totalStarts ?? 0}
                onDeleteResults={handleDeletedResults}
              >
                <ResultsTableContainer />
              </ResultsProvider>
            ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
