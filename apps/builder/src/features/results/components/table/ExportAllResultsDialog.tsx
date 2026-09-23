import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { convertResultsToTableData } from "@typebot.io/results/convertResultsToTableData";
import { getExportFileName } from "@typebot.io/results/getExportFileName";
import { parseBlockIdVariableIdMap } from "@typebot.io/results/parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import { sanitizeCsvCell } from "@typebot.io/results/sanitizeCsvCell";
import {
  type TimeFilter,
  timeFilterLabels,
} from "@typebot.io/results/timeFilter";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Progress } from "@typebot.io/ui/components/Progress";
import { Switch } from "@typebot.io/ui/components/Switch";
import { unparse } from "papaparse";
import { useState } from "react";
import { TimeFilterSelect } from "@/features/analytics/components/TimeFilterSelect";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { orpc, orpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useResults } from "../../ResultsProvider";
import { ExportJobProgress } from "./ExportJobProgress";

const TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT = 10000;
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  timeFilter: TimeFilter;
};

export const ExportAllResultsDialog = ({
  isOpen,
  onClose,
  timeFilter,
}: Props) => {
  const { typebot, publishedTypebot } = useTypebot();
  const workspaceId = typebot?.workspaceId;
  const typebotId = typebot?.id;
  const { resultHeader: existingResultHeader } = useResults();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportProgressValue, setExportProgressValue] = useState(0);
  const [isSchedulingEmail, setIsSchedulingEmail] = useState(false);
  const [exportWorkflowId, setExportWorkflowId] = useState<string>();
  const [exportWorkflowError, setExportWorkflowError] = useState<string>();

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] =
    useState(false);
  const [timeFilterOverride, setTimeFilterOverride] = useState<TimeFilter>();
  const selectedTimeFilter = timeFilterOverride ?? timeFilter;

  const { data: exportJobStatus, error: exportJobStatusError } = useQuery({
    queryKey: ["resultsExportJob", typebotId, exportWorkflowId],
    queryFn: () => {
      if (!typebotId || !exportWorkflowId)
        throw new Error("Export job ID is missing");
      return orpcClient.results.getExportJobStatus({
        typebotId,
        workflowId: exportWorkflowId,
      });
    },
    enabled: isOpen && isDefined(typebotId) && isDefined(exportWorkflowId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "error" ? false : 2000;
    },
    refetchIntervalInBackground: true,
  });
  const exportWorkflowChunk =
    exportJobStatus ??
    (exportWorkflowId
      ? { status: "starting" as const, workflowId: exportWorkflowId }
      : undefined);

  const { data: linkedTypebotsData } = useQuery(
    orpc.getLinkedTypebots.queryOptions({
      input: {
        typebotId: typebotId as string,
      },
      enabled: isDefined(typebotId),
    }),
  );

  const getAllResults = async (totalStarts: number) => {
    if (!workspaceId || !typebotId) return [];

    const allResults = [];
    let cursor: any = 0;
    setExportProgressValue(0);
    do {
      try {
        const { results, nextCursor } = await orpcClient.results.getResults({
          typebotId,
          limit: 500,
          cursor,
          timeFilter: selectedTimeFilter,
          timeZone,
        });
        allResults.push(...results);
        setExportProgressValue((allResults.length / totalStarts) * 100);
        cursor = nextCursor ?? undefined;
      } catch (error) {
        if (error instanceof ORPCError && error.message)
          toast({ description: error.message });
        return [];
      }
    } while (cursor);

    return allResults;
  };

  const exportAllResultsToCSV = async () => {
    if (!publishedTypebot || !typebotId) return;

    setIsExportLoading(true);

    const {
      stats: { totalStarts },
    } = await orpcClient.analytics.getStats({
      typebotId,
      timeFilter: selectedTimeFilter,
      timeZone,
    });

    if (totalStarts > TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT) {
      startBackgroundExport(typebotId, areDeletedBlocksIncluded);
      return;
    }

    const results = await getAllResults(totalStarts);

    if (!results.length) return setIsExportLoading(false);

    const resultHeader = areDeletedBlocksIncluded
      ? parseResultHeader({
          typebot: publishedTypebot,
          linkedTypebots: linkedTypebotsData?.typebots as Pick<
            Typebot,
            "groups" | "variables"
          >[],
          results,
        })
      : existingResultHeader;

    const dataToUnparse = convertResultsToTableData({
      results,
      headerCells: resultHeader,
      blockIdVariableIdMap: parseBlockIdVariableIdMap(typebot?.groups),
    });

    const headerIds = parseColumnsOrder(
      typebot?.resultsTablePreferences?.columnsOrder,
      resultHeader,
    ).reduce<string[]>((currentHeaderIds, columnId) => {
      if (
        typebot?.resultsTablePreferences?.columnsVisibility[columnId] === false
      )
        return currentHeaderIds;
      const columnLabel = resultHeader.find(
        (headerCell) => headerCell.id === columnId,
      )?.id;
      if (!columnLabel) return currentHeaderIds;
      currentHeaderIds.push(columnLabel);
      return currentHeaderIds;
    }, []);

    const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
      const newObject: { [key: string]: string } = {};
      headerIds?.forEach((headerId) => {
        const headerLabel = resultHeader.find(byId(headerId))?.label;
        if (!headerLabel) return;
        const newKey = parseUniqueKey(
          sanitizeCsvCell(headerLabel),
          Object.keys(newObject),
        );
        newObject[newKey] = sanitizeCsvCell(data[headerId]?.plainText);
      });
      return newObject;
    });

    const csvData = new Blob([unparse(data)], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = getExportFileName(typebot, selectedTimeFilter);
    const tempLink = document.createElement("a");
    tempLink.href = window.URL.createObjectURL(csvData);
    tempLink.setAttribute("download", fileName);
    tempLink.click();
    setIsExportLoading(false);
  };

  const startBackgroundExport = async (
    typebotId: string,
    includeDeletedBlocks: boolean,
  ) => {
    setExportWorkflowError(undefined);
    try {
      const { workflowId } = await orpcClient.results.startExportJob({
        typebotId,
        includeDeletedBlocks,
        timeFilter: selectedTimeFilter,
        timeZone,
      });
      setExportWorkflowId(workflowId);
    } catch (error) {
      console.error(error);
      if (error instanceof ORPCError) setExportWorkflowError(error.message);
      else if (error instanceof Error) setExportWorkflowError(error.message);
    } finally {
      setIsExportLoading(false);
    }
  };

  const sendExportedResultsToEmail = async () => {
    if (!exportWorkflowId || !typebotId) return;
    setIsSchedulingEmail(true);
    try {
      await orpcClient.results.triggerSendExportResultsToEmail({
        workflowId: exportWorkflowId,
        typebotId,
      });
    } catch (error) {
      console.error(error);
      toast({ description: "Could not schedule the export email" });
    } finally {
      setIsSchedulingEmail(false);
    }
  };

  const exportTitle =
    selectedTimeFilter === "allTime"
      ? "Export all results"
      : `Export results from ${timeFilterLabels[selectedTimeFilter].toLowerCase()}`;

  return (
    <Dialog.Root
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={() => {
        const shouldSendEmail =
          exportWorkflowId &&
          (exportWorkflowChunk?.status === "starting" ||
            exportWorkflowChunk?.status === "in_progress") &&
          !isSchedulingEmail &&
          !exportWorkflowError;
        setTimeFilterOverride(undefined);
        if (shouldSendEmail) sendExportedResultsToEmail();
      }}
    >
      <Dialog.Popup className="max-w-md">
        <Dialog.Title>{exportTitle}</Dialog.Title>
        <Dialog.CloseButton />
        {exportWorkflowChunk ? (
          <div className="flex flex-col gap-3">
            <ExportJobProgress chunk={exportWorkflowChunk} />
            {exportJobStatusError && (
              <Alert.Root variant="error">
                <Alert.Description>
                  Could not refresh export status. Retrying...
                </Alert.Description>
              </Alert.Root>
            )}
          </div>
        ) : isExportLoading ? (
          <div className="flex flex-col gap-2">
            <p>Fetching all results...</p>
            <Progress.Root value={exportProgressValue} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {exportWorkflowError && (
              <Alert.Root variant="error">
                <Alert.Description>{exportWorkflowError}</Alert.Description>
              </Alert.Root>
            )}
            <Field.Root>
              <Field.Label>Time period</Field.Label>
              <TimeFilterSelect
                timeFilter={selectedTimeFilter}
                onTimeFilterChange={setTimeFilterOverride}
                className="w-full"
              />
            </Field.Root>
            <Field.Root className="flex-row items-center">
              <Switch
                checked={areDeletedBlocksIncluded}
                onCheckedChange={setAreDeletedBlocksIncluded}
              />
              <Field.Label>
                Include deleted blocks{" "}
                <MoreInfoTooltip>
                  Blocks from previous bot version that have been deleted
                </MoreInfoTooltip>
              </Field.Label>
            </Field.Root>
          </div>
        )}
        {!exportWorkflowChunk && (
          <Dialog.Footer>
            <Button onClick={onClose} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button
              onClick={exportAllResultsToCSV}
              size="sm"
              disabled={isExportLoading}
            >
              Export
            </Button>
          </Dialog.Footer>
        )}
      </Dialog.Popup>
    </Dialog.Root>
  );
};
