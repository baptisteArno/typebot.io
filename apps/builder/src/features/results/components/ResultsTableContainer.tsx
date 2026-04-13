import { Stack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { LogsModal } from './LogsModal'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useResults } from '../ResultsProvider'
import { ResultModal } from './ResultModal'
import { FlowReplayModal } from './FlowReplayModal'
import { ResultsTable } from './table/ResultsTable'
import { useRouter } from 'next/router'
import { timeFilterValues } from '@/features/analytics/constants'

type Props = {
  timeFilter: (typeof timeFilterValues)[number]
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void
  helpdeskIdFilter: string
  onHelpdeskIdFilterChange: (value: string) => void
}
export const ResultsTableContainer = ({
  timeFilter,
  onTimeFilterChange,
  helpdeskIdFilter,
  onHelpdeskIdFilterChange,
}: Props) => {
  const { query } = useRouter()
  const {
    flatResults: results,
    fetchNextPage,
    hasNextPage,
    resultHeader,
    tableData,
  } = useResults()
  const { typebot, publishedTypebot } = useTypebot()
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<
    string | null
  >(null)
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null)
  const [flowReplayResultId, setFlowReplayResultId] = useState<string | null>(
    null
  )

  const handleLogsModalClose = () => setInspectingLogsResultId(null)

  const handleResultModalClose = () => setExpandedResultId(null)

  const handleFlowReplayClose = () => setFlowReplayResultId(null)

  const handleLogOpenIndex = (index: number) => () => {
    if (!results[index]) return
    setInspectingLogsResultId(results[index].id)
  }

  const handleResultExpandIndex = (index: number) => () => {
    if (!results[index]) return
    setExpandedResultId(results[index].id)
  }

  const handleFlowReplayIndex = (index: number) => () => {
    if (!results[index]) return
    setFlowReplayResultId(results[index].id)
  }

  useEffect(() => {
    if (query.id) setExpandedResultId(query.id as string)
  }, [query.id])

  return (
    <Stack pb="28" px={['4', '0']} spacing="4" maxW="1600px" w="full">
      {publishedTypebot && (
        <LogsModal
          typebotId={publishedTypebot?.typebotId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsModalClose}
        />
      )}
      <ResultModal
        resultId={expandedResultId}
        onClose={handleResultModalClose}
      />
      <FlowReplayModal
        resultId={flowReplayResultId}
        onClose={handleFlowReplayClose}
      />

      {typebot && (
        <ResultsTable
          preferences={typebot.resultsTablePreferences ?? undefined}
          resultHeader={resultHeader}
          data={tableData}
          results={results}
          onScrollToBottom={fetchNextPage}
          hasMore={hasNextPage}
          timeFilter={timeFilter}
          onLogOpenIndex={handleLogOpenIndex}
          onResultExpandIndex={handleResultExpandIndex}
          onFlowReplayIndex={handleFlowReplayIndex}
          onTimeFilterChange={onTimeFilterChange}
          helpdeskIdFilter={helpdeskIdFilter}
          onHelpdeskIdFilterChange={onHelpdeskIdFilterChange}
        />
      )}
    </Stack>
  )
}
