import {
  HStack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseUniqueKey } from "@typebot.io/lib/parseUniqueKey";
import { byId } from "@typebot.io/lib/utils";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import { Button } from "@typebot.io/ui/components/Button";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { unparse } from "papaparse";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DownloadIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useResults } from "../../ResultsProvider";

type Props = {
  selectedResultsId: string[];
  onClearSelection: () => void;
};

export const SelectionToolbar = ({
  selectedResultsId,
  onClearSelection,
}: Props) => {
  const selectLabelColor = useColorModeValue("blue.500", "blue.200");
  const { typebot } = useTypebot();
  const { resultHeader, tableData, onDeleteResults } = useResults();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const queryClient = useQueryClient();
  const deleteResultsMutation = useMutation(
    trpc.results.deleteResults.mutationOptions({
      onMutate: () => {
        setIsDeleteLoading(true);
      },
      onError: (error) => toast({ description: error.message }),
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.results.getResults.pathFilter(),
        );
      },
      onSettled: () => {
        onDeleteResults(selectedResultsId.length);
        onClearSelection();
        setIsDeleteLoading(false);
      },
    }),
  );

  const workspaceId = typebot?.workspaceId;
  const typebotId = typebot?.id;

  const totalSelected = selectedResultsId.length;

  const deleteResults = async () => {
    if (!workspaceId || !typebotId) return;
    deleteResultsMutation.mutate({
      typebotId,
      resultIds: selectedResultsId.join(","),
    });
  };

  const exportResultsToCSV = async () => {
    setIsExportLoading(true);

    const dataToUnparse = tableData.filter((data) =>
      selectedResultsId.includes(data.id.plainText),
    );

    const headerIds = parseColumnsOrder(
      typebot?.resultsTablePreferences?.columnsOrder,
      resultHeader,
    )
      .reduce<string[]>((currentHeaderIds, columnId) => {
        if (
          typebot?.resultsTablePreferences?.columnsVisibility[columnId] ===
          false
        )
          return currentHeaderIds;
        const columnLabel = resultHeader.find(
          (headerCell) => headerCell.id === columnId,
        )?.id;
        if (!columnLabel) return currentHeaderIds;
        return [...currentHeaderIds, columnLabel];
      }, [])
      .concat(
        typebot?.resultsTablePreferences?.columnsOrder
          ? resultHeader
              .filter(
                (headerCell) =>
                  !typebot?.resultsTablePreferences?.columnsOrder.includes(
                    headerCell.id,
                  ),
              )
              .map((headerCell) => headerCell.id)
          : [],
      );

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

  if (totalSelected === 0) return null;

  return (
    <HStack rounded="md" spacing={0}>
      <Button
        variant="secondary"
        color={selectLabelColor}
        className="border-r rounded-r-none"
        onClick={onClearSelection}
        size="sm"
      >
        {totalSelected} selected
      </Button>
      <Button
        variant="secondary"
        className="border-r rounded-r-none rounded-l-none size-8"
        aria-label="Export"
        onClick={exportResultsToCSV}
        disabled={isExportLoading}
        size="icon"
      >
        <DownloadIcon />
      </Button>
      <Button
        variant="secondary"
        aria-label="Delete"
        className="rounded-l-none size-8"
        onClick={onOpen}
        disabled={isDeleteLoading}
        size="icon"
      >
        <TrashIcon />
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={deleteResults}
        onClose={onClose}
        actionType="destructive"
        confirmButtonLabel="Delete"
      >
        <Text>
          You are about to delete{" "}
          <strong>
            {totalSelected} submission
            {totalSelected > 1 ? "s" : ""}
          </strong>
          . Are you sure you wish to continue?
        </Text>
      </ConfirmDialog>
    </HStack>
  );
};
