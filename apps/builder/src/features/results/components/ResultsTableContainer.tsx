import { Stack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { LogsModal } from './LogsModal'
import { useTypebot } from '@/features/editor'
import { useResults } from '../ResultsProvider'
import { ResultModal } from './ResultModal'
import { SubmissionsTable } from './ResultsTable'

export const ResultsTableContainer = () => {
  const {
    flatResults: results,
    fetchMore,
    hasMore,
    resultHeader,
    tableData,
  } = useResults()
  const { typebot, publishedTypebot } = useTypebot()
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<
    string | null
  >(null)
  const [expandedResultIndex, setExpandedResultIndex] = useState<number | null>(
    null
  )

  const handleLogsModalClose = () => setInspectingLogsResultId(null)

  const handleResultModalClose = () => setExpandedResultIndex(null)

  const handleLogOpenIndex = (index: number) => () => {
    if (!results[index]) return
    setInspectingLogsResultId(results[index].id)
  }

  const handleResultExpandIndex = (index: number) => () =>
    setExpandedResultIndex(index)

  return (
    <Stack
      pb="28"
      px={['4', '0']}
      spacing="4"
      maxW="1600px"
      overflow="scroll"
      w="full"
    >
      {publishedTypebot && (
        <LogsModal
          typebotId={publishedTypebot?.typebotId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsModalClose}
        />
      )}
      <ResultModal
        resultIdx={expandedResultIndex}
        onClose={handleResultModalClose}
      />

      {typebot && (
        <SubmissionsTable
          preferences={typebot.resultsTablePreferences}
          resultHeader={resultHeader}
          data={tableData}
          onScrollToBottom={fetchMore}
          hasMore={hasMore}
          onLogOpenIndex={handleLogOpenIndex}
          onResultExpandIndex={handleResultExpandIndex}
        />
      )}
    </Stack>
  )
}
