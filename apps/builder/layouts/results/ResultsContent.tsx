import { Button, Flex, HStack, Tag, useToast, Text } from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { useStats } from 'services/analytics'
import { AnalyticsContent } from './AnalyticsContent'
import { SubmissionsContent } from './SubmissionContent'

export const ResultsContent = () => {
  const router = useRouter()
  const { typebot } = useTypebot()
  const isAnalytics = useMemo(
    () => router.pathname.endsWith('analytics'),
    [router.pathname]
  )
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { stats, mutate } = useStats({
    typebotId: typebot?.id,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })

  const handleDeletedResults = (total: number) => {
    if (!stats) return
    mutate({
      stats: { ...stats, totalStarts: stats.totalStarts - total },
    })
  }

  return (
    <Flex h="full" w="full">
      <Flex
        pos="absolute"
        zIndex={2}
        bgColor="white"
        w="full"
        justifyContent="center"
        h="60px"
      >
        <HStack maxW="1200px" w="full">
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
      <Flex pt="60px" w="full" justify="center">
        {typebot &&
          (isAnalytics ? (
            <AnalyticsContent stats={stats} />
          ) : (
            <SubmissionsContent
              typebotId={typebot.id}
              onDeleteResults={handleDeletedResults}
              totalResults={stats?.totalStarts ?? 0}
            />
          ))}
      </Flex>
    </Flex>
  )
}
