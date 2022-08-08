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
