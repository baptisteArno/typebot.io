import {
  Button,
  Flex,
  HStack,
  Stack,
  Tag,
  useToast,
  Text,
} from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useTypebot } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { useResultsCount } from 'services/results'
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

  const { totalResults } = useResultsCount({
    typebotId: typebot?.id,
    onError: (err) => toast({ title: err.name, description: err.message }),
  })
  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start">
      <Stack maxW="1200px" w="full" pt="4" spacing={6}>
        <HStack>
          <Button
            as={NextChakraLink}
            colorScheme={!isAnalytics ? 'blue' : 'gray'}
            variant={!isAnalytics ? 'outline' : 'ghost'}
            size="sm"
            href={`/typebots/${typebot?.id}/results`}
          >
            <Text>Submissions</Text>
            {totalResults && (
              <Tag size="sm" colorScheme="blue" ml="1">
                {totalResults}
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
        {typebot &&
          (isAnalytics ? (
            <AnalyticsContent />
          ) : (
            <SubmissionsContent
              typebotId={typebot.id}
              totalResults={totalResults ?? 0}
            />
          ))}
      </Stack>
    </Flex>
  )
}
