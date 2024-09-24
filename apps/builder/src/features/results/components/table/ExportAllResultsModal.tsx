import { AlertInfo } from "@/components/AlertInfo";
import { DownloadIcon } from "@/components/icons";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { TRPCError } from "@trpc/server";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { convertResultsToTableData } from "@typebot.io/results/convertResultsToTableData";
import { parseBlockIdVariableIdMap } from "@typebot.io/results/parseBlockIdVariableIdMap";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { parseResultHeader } from "@typebot.io/results/parseResultHeader";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { unparse } from "papaparse";
import { useState } from "react";
import { useResults } from "../../ResultsProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExportAllResultsModal = ({ isOpen, onClose }: Props) => {
  const { typebot, publishedTypebot } = useTypebot();
  const workspaceId = typebot?.workspaceId;
  const typebotId = typebot?.id;
  const { showToast } = useToast();
  const { resultHeader: existingResultHeader, totalResults } = useResults();
  const trpcContext = trpc.useContext();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportProgressValue, setExportProgressValue] = useState(0);

  const [areDeletedBlocksIncluded, setAreDeletedBlocksIncluded] =
    useState(false);

  const { data: linkedTypebotsData } = trpc.getLinkedTypebots.useQuery(
    {
      typebotId: typebotId as string,
    },
    {
      enabled: isDefined(typebotId),
    },
  );

  const getAllResults = async () => {
    if (!workspaceId || !typebotId) return [];
    const allResults = [];
    let cursor: string | undefined;
    setExportProgressValue(0);
    do {
      try {
        const { results, nextCursor } =
          await trpcContext.results.getResults.fetch({
            typebotId,
            limit: 100,
            cursor,
            timeFilter: "allTime",
          });
        allResults.push(...results);
        setExportProgressValue((allResults.length / totalResults) * 100);
        cursor = nextCursor ?? undefined;
      } catch (error) {
        showToast({ description: (error as TRPCError).message });
        return [];
      }
    } while (cursor);

    return allResults;
  };

  const exportAllResultsToCSV = async () => {
    if (!publishedTypebot) return;

    setIsExportLoading(true);

    const results = await getAllResults();

    if (!results.length) return setIsExportLoading(false);

    const resultHeader = areDeletedBlocksIncluded
      ? parseResultHeader(
          publishedTypebot,
          linkedTypebotsData?.typebots as Pick<
            Typebot,
            "groups" | "variables"
          >[],
          results,
        )
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
    const fileName = `typebot-export_${new Date()
      .toLocaleDateString()
      .replaceAll("/", "-")}`;
    const tempLink = document.createElement("a");
    tempLink.href = window.URL.createObjectURL(csvData);
    tempLink.setAttribute("download", `${fileName}.csv`);
    tempLink.click();
    setIsExportLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody as={Stack} spacing="4">
          <SwitchWithLabel
            label="Include deleted blocks"
            moreInfoContent="Blocks from previous bot version that have been deleted"
            initialValue={false}
            onCheckChange={setAreDeletedBlocksIncluded}
          />
          {totalResults > 2000 ? (
            <AlertInfo>The export may take a while.</AlertInfo>
          ) : (
            <AlertInfo>The export may take up to 1 minute.</AlertInfo>
          )}
          {isExportLoading && (
            <Stack>
              <Text>Fetching all results...</Text>
              <Progress value={exportProgressValue} borderRadius="md" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button onClick={onClose} variant="ghost" size="sm">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={exportAllResultsToCSV}
            leftIcon={<DownloadIcon />}
            size="sm"
            isLoading={isExportLoading}
          >
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
