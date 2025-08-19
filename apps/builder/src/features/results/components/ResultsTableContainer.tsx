import type { timeFilterValues } from "@/features/analytics/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useResults } from "../ResultsProvider";
import { LogsDialog } from "./LogsDialog";
import { ResultDialog } from "./ResultDialog";
import { ResultsTable } from "./table/ResultsTable";

type Props = {
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
};
export const ResultsTableContainer = ({
  timeFilter,
  onTimeFilterChange,
}: Props) => {
  const { query } = useRouter();
  const {
    flatResults: results,
    fetchNextPage,
    hasNextPage,
    resultHeader,
    tableData,
  } = useResults();
  const { typebot, publishedTypebot } = useTypebot();
  const [inspectingLogsResultId, setInspectingLogsResultId] = useState<
    string | null
  >(null);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  const handleLogsDialogClose = () => setInspectingLogsResultId(null);

  const handleResultDialogClose = () => setExpandedResultId(null);

  const handleLogOpenIndex = (index: number) => () => {
    if (!results[index]) return;
    setInspectingLogsResultId(results[index].id);
  };

  const handleResultExpandIndex = (index: number) => () => {
    if (!results[index]) return;
    setExpandedResultId(results[index].id);
  };

  useEffect(() => {
    if (query.id) setExpandedResultId(query.id as string);
  }, [query.id]);

  return (
    <Stack pb="28" px={["4", "0"]} spacing="4" maxW="1600px" w="full">
      {publishedTypebot && (
        <LogsDialog
          typebotId={publishedTypebot?.typebotId}
          resultId={inspectingLogsResultId}
          onClose={handleLogsDialogClose}
        />
      )}
      <ResultDialog
        resultId={expandedResultId}
        onClose={handleResultDialogClose}
      />

      {typebot && (
        <ResultsTable
          preferences={typebot.resultsTablePreferences ?? undefined}
          resultHeader={resultHeader}
          data={tableData}
          onScrollToBottom={fetchNextPage}
          hasMore={hasNextPage}
          timeFilter={timeFilter}
          onLogOpenIndex={handleLogOpenIndex}
          onResultExpandIndex={handleResultExpandIndex}
          onTimeFilterChange={onTimeFilterChange}
        />
      )}
    </Stack>
  );
};
