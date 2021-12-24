import { Button, Flex, HStack, Stack } from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useTypebot } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { AnalyticsContent } from './AnalyticsContent'
import { SubmissionsContent } from './SubmissionContent'

export const ResultsContent = () => {
  const router = useRouter()
  const { typebot } = useTypebot()
  const isAnalytics = useMemo(
    () => router.pathname.endsWith('analytics'),
    [router.pathname]
  )
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
            Submissions
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
        {isAnalytics ? <AnalyticsContent /> : <SubmissionsContent />}
      </Stack>
    </Flex>
  )
}
