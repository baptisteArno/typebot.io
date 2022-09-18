import { Seo } from 'components/Seo'
import { TypebotHeader } from 'components/shared/TypebotHeader'
import React, { useMemo } from 'react'
import { HStack, Button, Tag, Flex, Text } from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { ResultsContent } from 'components/results/ResultsContent'
import { useTypebot } from 'contexts/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { AnalyticsContent } from 'components/analytics/AnalyticsContent'
import { useRouter } from 'next/router'
import { useStats } from 'services/analytics'
import { useToast } from 'components/shared/hooks/useToast'
import { ResultsProvider } from 'contexts/ResultsProvider'
import { UnlockPlanInfo } from 'components/shared/Info'
import { getChatsLimit, getStorageLimit } from 'utils'
import { useUsage } from 'components/dashboard/WorkspaceSettingsModal/BillingContent/UsageContent/useUsage'

const ALERT_CHATS_PERCENT_THRESHOLD = 80
const ALERT_STORAGE_PERCENT_THRESHOLD = 80

const ResultsPage = () => {
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
        })) *
        100
    )
  }, [
    usageData?.totalChatsUsed,
    workspace?.additionalChatsIndex,
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
        })) *
        100
    )
  }, [
    usageData?.totalStorageUsed,
    workspace?.additionalStorageIndex,
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
          <UnlockPlanInfo
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
          <UnlockPlanInfo
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
          bgColor="white"
          w="full"
          justifyContent="center"
          h="60px"
          display={['none', 'flex']}
        >
          <HStack maxW="1600px" w="full" px="4">
            <Button
              as={NextChakraLink}
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
              as={NextChakraLink}
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
              <AnalyticsContent stats={stats} />
            ) : (
              <ResultsProvider
                workspaceId={workspace.id}
                typebotId={publishedTypebot.typebotId}
                totalResults={stats?.totalStarts ?? 0}
                onDeleteResults={handleDeletedResults}
              >
                <ResultsContent />
              </ResultsProvider>
            ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ResultsPage
