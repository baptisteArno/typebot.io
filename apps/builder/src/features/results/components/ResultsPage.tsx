import { Seo } from '@/components/Seo'
import { AnalyticsGraphContainer } from '@/features/analytics/components/AnalyticsGraphContainer'
import { TypebotHeader } from '@/features/editor/components/TypebotHeader'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
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
import { useMemo, useState } from 'react'
import { ResultsProvider } from '../ResultsProvider'
import { ResultsTableContainer } from './ResultsTableContainer'
import { TypebotNotFoundPage } from '@/features/editor/components/TypebotNotFoundPage'
import { trpc } from '@/lib/trpc'
import {
  defaultTimeFilter,
  timeFilterValues,
} from '@/features/analytics/constants'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const ResultsPage = () => {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { typebot, publishedTypebot, is404 } = useTypebot()
  const isAnalytics = useMemo(
    () => router.pathname.endsWith('analytics'),
    [router.pathname]
  )
  const bgColor = useColorModeValue(
    isAnalytics ? '#f4f5f8' : 'white',
    isAnalytics ? 'gray.850' : 'gray.900'
  )
  const navBorderColor = useColorModeValue('gray.200', 'gray.700')
  const navBg = useColorModeValue('white', 'gray.900')

  const [timeFilter, setTimeFilter] =
    useState<(typeof timeFilterValues)[number]>(defaultTimeFilter)
  const [helpdeskIdFilter, setHelpdeskIdFilter] = useState('')

  const { showToast } = useToast()

  const { data: { stats } = {}, refetch } = trpc.analytics.getStats.useQuery(
    {
      typebotId: publishedTypebot?.typebotId as string,
      timeFilter,
      timeZone,
    },
    {
      enabled: !!publishedTypebot,
      onError: (err) => showToast({ description: err.message }),
    }
  )

  const handleDeletedResults = () => {
    if (!stats) return
    refetch()
  }

  const activeColor = 'blue.600'
  const activeBg = 'blue.50'
  const inactiveColor = 'gray.500'
  const inactiveHoverBg = 'gray.100'

  if (is404) return <TypebotNotFoundPage />
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo
        title={
          isAnalytics
            ? typebot?.name
              ? `${typebot.name} | Analytics`
              : 'Analytics'
            : typebot?.name
            ? `${typebot.name} | Results`
            : 'Results'
        }
      />
      <TypebotHeader />
      <Flex
        h="full"
        w="full"
        bgColor={bgColor}
        direction="column"
        overflow="hidden"
      >
        <Flex
          pos="absolute"
          zIndex={2}
          w="full"
          justifyContent="center"
          h="52px"
          display={['none', 'flex']}
          borderBottomWidth="1px"
          borderColor={navBorderColor}
          bg={navBg}
        >
          <HStack maxW="1600px" w="full" px="4" spacing="1">
            <Button
              as={Link}
              variant="ghost"
              size="sm"
              href={`/typebots/${typebot?.id}/results`}
              rounded="lg"
              fontWeight={!isAnalytics ? 'semibold' : 'normal'}
              color={!isAnalytics ? activeColor : inactiveColor}
              bg={!isAnalytics ? activeBg : 'transparent'}
              _hover={{ bg: !isAnalytics ? activeBg : inactiveHoverBg }}
            >
              <Text>Submissions</Text>
              {(stats?.totalStarts ?? 0) > 0 && (
                <Tag
                  size="sm"
                  bg={!isAnalytics ? 'blue.100' : 'gray.100'}
                  color={!isAnalytics ? 'blue.700' : 'gray.600'}
                  ml="1.5"
                  rounded="full"
                  fontWeight="bold"
                  fontSize="2xs"
                >
                  {stats?.totalStarts}
                </Tag>
              )}
            </Button>
            <Button
              as={Link}
              variant="ghost"
              size="sm"
              href={`/typebots/${typebot?.id}/results/analytics`}
              rounded="lg"
              fontWeight={isAnalytics ? 'semibold' : 'normal'}
              color={isAnalytics ? activeColor : inactiveColor}
              bg={isAnalytics ? activeBg : 'transparent'}
              _hover={{ bg: isAnalytics ? activeBg : inactiveHoverBg }}
            >
              Analytics
            </Button>
          </HStack>
        </Flex>
        <Flex
          pt={['10px', '52px']}
          w="full"
          justify="center"
          overflow="hidden"
          flex="1"
          minH="0"
        >
          {workspace &&
            publishedTypebot &&
            (isAnalytics ? (
              <AnalyticsGraphContainer
                stats={stats}
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
              />
            ) : (
              <ResultsProvider
                timeFilter={timeFilter}
                typebotId={publishedTypebot.typebotId}
                totalResults={stats?.totalStarts ?? 0}
                onDeleteResults={handleDeletedResults}
                helpdeskId={helpdeskIdFilter || undefined}
              >
                <ResultsTableContainer
                  timeFilter={timeFilter}
                  onTimeFilterChange={setTimeFilter}
                  helpdeskIdFilter={helpdeskIdFilter}
                  onHelpdeskIdFilterChange={setHelpdeskIdFilter}
                />
              </ResultsProvider>
            ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
