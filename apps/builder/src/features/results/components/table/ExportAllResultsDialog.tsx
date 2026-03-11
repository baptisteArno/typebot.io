import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { convertResultsToTableData } from "@typebot.io/results/convertResultsToTableData";
import { getExportFileName } from "@typebot.io/results/getExportFileName";
import { parseBlockIdVariableIdMap } from "@typebot.io/results/parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import type { ExportResultsWorkflowStatusChunk } from "@typebot.io/results/workflows/rpc";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Progress } from "@typebot.io/ui/components/Progress";
import { Switch } from "@typebot.io/ui/components/Switch";
import { unparse } from "papaparse";
import { useRef, useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { orpc, orpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useResults } from "../../ResultsProvider";
import { ExportJobProgress } from "./ExportJobProgress";

const TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT = 10000;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExportAllResultsDialog = ({ isOpen, onClose }: Props) => {
  const { typebot, publishedTypebot } = useTypebot();
  const workspaceId = typebot?.workspaceId;
  const typebotId = typebot?.id;
  const { resultHeader: existingResultHeader } = useResults();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportProgressValue, setExportProgressValue] = useState(0);
  const [isSchedulingEmail, setIsSchedulingEmail] = useState(false);
  const [exportWorkflowId, setExportWorkflowId] = useState<string>();
  const [lastExportWorkflowChunk, setLastExportWorkflowChunk] =
    useState<ExportResultsWorkflowStatusChunk>();
  const [exportWorkflowError, setExportWorkflowError] = useState<string>();

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] =
    useState(false);
  const exportIteratorRef =
    useRef<AsyncIterator<ExportResultsWorkflowStatusChunk> | null>(null);
  const typebotIdRef = useRef<string | undefined>(typebotId);
  const exportWorkflowIdRef = useRef<string | undefined>(undefined);

  typebotIdRef.current = typebotId;
  exportWorkflowIdRef.current = exportWorkflowId;

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
          timeFilter: "allTime",
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
      timeFilter: "allTime",
    });

    if (totalStarts > TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT) {
      consumeExportIterator(typebotId, areDeletedBlocksIncluded);
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
        const newKey = parseUniqueKey(headerLabel, Object.keys(newObject));
        newObject[newKey] = data[headerId]?.plainText;
      });
      return newObject;
    });

    const csvData = new Blob([unparse(data)], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = getExportFileName(typebot);
    const tempLink = document.createElement("a");
    tempLink.href = window.URL.createObjectURL(csvData);
    tempLink.setAttribute("download", fileName);
    tempLink.click();
    setIsExportLoading(false);
  };

  const consumeExportIterator = async (
    typebotId: string,
    includeDeletedBlocks: boolean,
  ) => {
    try {
      const iterator = await orpcClient.results.streamExportJob({
        typebotId,
        includeDeletedBlocks,
      });
      exportIteratorRef.current = iterator;
      for await (const chunk of iterator) {
        if (chunk.status === "starting") setExportWorkflowId(chunk.workflowId);
        setLastExportWorkflowChunk(chunk);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ORPCError) setExportWorkflowError(error.message);
      else if (error instanceof Error) setExportWorkflowError(error.message);
    }
  };

  const sendExportedResultsToEmail = async () => {
    if (!lastExportWorkflowChunk || !exportWorkflowId || !typebotId) return;
    setIsSchedulingEmail(true);
    await orpcClient.results.triggerSendExportResultsToEmail({
      workflowId: exportWorkflowId,
      typebotId,
    });
    onClose();
  };

  return (
    <Dialog.Root
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={() => {
        const shouldSendEmail =
          exportWorkflowId &&
          (lastExportWorkflowChunk?.status === "starting" ||
            lastExportWorkflowChunk?.status === "in_progress") &&
          !isSchedulingEmail &&
          !exportWorkflowError;
        if (shouldSendEmail) sendExportedResultsToEmail();
      }}
    >
      <Dialog.Popup className="max-w-md">
        <Dialog.Title>Export all results</Dialog.Title>
        <Dialog.CloseButton />
        {lastExportWorkflowChunk ? (
          <ExportJobProgress
            chunk={lastExportWorkflowChunk}
            error={exportWorkflowError}
          />
        ) : isExportLoading ? (
          <div className="flex flex-col gap-2">
            <p>Fetching all results...</p>
            <Progress.Root value={exportProgressValue} />
          </div>
        ) : (
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
        )}
        {!lastExportWorkflowChunk && (
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
