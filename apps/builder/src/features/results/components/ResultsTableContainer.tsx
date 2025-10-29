import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { timeFilterValues } from "@/features/analytics/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
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
    <div className="flex flex-col pb-28 gap-4 max-w-[1600px] w-full px-4 sm:px-0">
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
    </div>
  );
};
