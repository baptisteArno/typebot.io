import { HStack, Text } from "@chakra-ui/react";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useState } from "react";
import {
  ChevronRightIcon,
  DownloadIcon,
  ListIcon,
  MoreHorizontalIcon,
} from "@/components/icons";
import { useOpenControls } from "@/hooks/useOpenControls";
import { ColumnSettings } from "./ColumnSettings";
import { ExportAllResultsDialog } from "./ExportAllResultsDialog";

type Props = {
  resultHeader: ResultHeaderCell[];
  columnVisibility: { [key: string]: boolean };
  columnOrder: string[];
  onColumnOrderChange: (columnOrder: string[]) => void;
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void;
};

export const TableSettingsButton = (props: Props) => {
  const controls = useOpenControls();
  const exportAllDialogControls = useOpenControls();

  return (
    <>
      <Popover.Root {...controls}>
        <Popover.Trigger>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Open table settings"
            className="size-8"
          >
            <MoreHorizontalIcon />
          </Button>
        </Popover.Trigger>
        <Popover.Popup className="w-[300px] p-0" side="bottom" align="end">
          <TableSettingsMenu
            {...props}
            onExportAllClick={exportAllDialogControls.onOpen}
          />
        </Popover.Popup>
      </Popover.Root>
      <ExportAllResultsDialog
        onClose={exportAllDialogControls.onClose}
        isOpen={exportAllDialogControls.isOpen}
      />
    </>
  );
};

const TableSettingsMenu = ({
  resultHeader,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  onColumnOrderChange,
  onExportAllClick,
}: Props & { onExportAllClick: () => void }) => {
  const [selectedMenu, setSelectedMenu] = useState<
    "export" | "columnSettings" | null
  >(null);

  switch (selectedMenu) {
    case "columnSettings":
      return (
        <div className="p-4">
          <ColumnSettings
            resultHeader={resultHeader}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
          />
        </div>
      );
    default:
      return (
        <div className="flex flex-col">
          <Button
            onClick={() => setSelectedMenu("columnSettings")}
            variant="ghost"
            className="rounded-b-none justify-between"
          >
            <HStack>
              <ListIcon />
              <Text>Column settings</Text>
            </HStack>

            <ChevronRightIcon color="gray.400" />
          </Button>
          <Button
            onClick={onExportAllClick}
            variant="ghost"
            className="rounded-t-none justify-between"
          >
            <HStack>
              <DownloadIcon />
              <Text>Export all</Text>
            </HStack>
          </Button>
        </div>
      );
  }
};
