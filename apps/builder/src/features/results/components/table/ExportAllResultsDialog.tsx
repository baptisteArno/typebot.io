import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TRPCError } from "@trpc/server";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { convertResultsToTableData } from "@typebot.io/results/convertResultsToTableData";
import { getExportFileName } from "@typebot.io/results/getExportFileName";
import { parseBlockIdVariableIdMap } from "@typebot.io/results/parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Progress } from "@typebot.io/ui/components/Progress";
import { Switch } from "@typebot.io/ui/components/Switch";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { unparse } from "papaparse";
import { useState } from "react";
import { EmailInputIcon } from "@/features/blocks/inputs/emailInput/components/EmailInputIcon";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc, trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useResults } from "../../ResultsProvider";
import { ExportJobProgress } from "./ExportJobProgress";

const TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT = 10000;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExportAllResultsDialog = ({ isOpen, onClose }: Props) => {
  const [
    backgroundExportSubscriptionToken,
    setBackgroundExportSubscriptionToken,
  ] = useState<any>();
  const { typebot, publishedTypebot } = useTypebot();
  const workspaceId = typebot?.workspaceId;
  const typebotId = typebot?.id;
  const { resultHeader: existingResultHeader, totalResults } = useResults();
  const queryClient = useQueryClient();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportProgressValue, setExportProgressValue] = useState(0);
  const [isSchedulingEmail, setIsSchedulingEmail] = useState(false);

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] =
    useState(false);

  const { data: linkedTypebotsData } = useQuery(
    trpc.getLinkedTypebots.queryOptions(
      {
        typebotId: typebotId as string,
      },
      {
        enabled: isDefined(typebotId),
      },
    ),
  );

  const getAllResults = async (totalStarts: number) => {
    if (!workspaceId || !typebotId) return [];

    const allResults = [];
    let cursor: any = 0;
    setExportProgressValue(0);
    do {
      try {
        const { results, nextCursor } = await queryClient.fetchQuery(
          trpc.results.getResults.queryOptions({
            typebotId,
            limit: 500,
            cursor,
            timeFilter: "allTime",
          }),
        );
        allResults.push(...results);
        setExportProgressValue((allResults.length / totalStarts) * 100);
        cursor = nextCursor ?? undefined;
      } catch (error) {
        toast({ description: (error as TRPCError).message });
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
    } = await trpcClient.analytics.getStats.query({
      typebotId,
      timeFilter: "allTime",
    });

    if (totalStarts > TOTAL_RESULTS_THRESHOLD_FOR_BACKGROUND_EXPORT) {
      const response = await trpcClient.results.triggerExportJob.mutate({
        typebotId,
      });
      if (response.status === "success") {
        setBackgroundExportSubscriptionToken(response.token);
        return;
      }
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
      return [...currentHeaderIds, columnLabel];
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

  const sendExportedResultsToEmail = async () => {
    if (!latestData?.data) return;
    setIsSchedulingEmail(true);
    await trpcClient.results.triggerSendExportResultsToEmail.mutate();
    onClose();
  };

  const { latestData, error } = useInngestSubscription({
    token: backgroundExportSubscriptionToken!,
    enabled: isDefined(backgroundExportSubscriptionToken),
  });

  return (
    <Dialog.Root
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={async () => {
        setBackgroundExportSubscriptionToken(undefined);
        setIsExportLoading(false);
        if (
          latestData &&
          latestData.data?.status !== "complete" &&
          !isSchedulingEmail
        )
          await trpcClient.results.triggerCancelExport.mutate();
        setIsSchedulingEmail(false);
      }}
    >
      <Dialog.Popup className="max-w-md">
        <Dialog.Title>Export all results</Dialog.Title>
        <Dialog.CloseButton />
        {latestData && backgroundExportSubscriptionToken ? (
          <ExportJobProgress data={latestData?.data} error={error} />
        ) : isExportLoading ? (
          <div className="flex flex-col gap-2">
            <p>Fetching all results...</p>
            <Progress.Root value={exportProgressValue} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
            <Alert.Root>
              <InformationSquareIcon />
              <Alert.Description>
                {totalResults > 2000
                  ? "The export may take a while."
                  : "The export may take up to 1 minute."}
              </Alert.Description>
            </Alert.Root>
          </div>
        )}
        <Dialog.Footer>
          <Button onClick={onClose} variant="ghost" size="sm">
            Cancel
          </Button>
          {latestData?.data && backgroundExportSubscriptionToken ? (
            <Button
              size="sm"
              disabled={
                latestData?.data.status !== "processing" || isSchedulingEmail
              }
              onClick={sendExportedResultsToEmail}
            >
              <EmailInputIcon /> Send by email once done
            </Button>
          ) : (
            <Button
              onClick={exportAllResultsToCSV}
              size="sm"
              disabled={isExportLoading}
            >
              Export
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
