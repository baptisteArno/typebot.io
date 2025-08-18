import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { HStack, Input } from "@chakra-ui/react";
import type { Sheet } from "../types";

type Props = {
  sheets: Sheet[];
  isLoading: boolean;
  sheetId?: string;
  onSelectSheetId: (id: string | undefined) => void;
};

export const SheetsDropdown = ({
  sheets,
  isLoading,
  sheetId,
  onSelectSheetId,
}: Props) => {
  if (isLoading) return <Input value="Loading..." isDisabled />;
  if (!sheets || sheets.length === 0)
    return (
      <HStack>
        <Input value="No sheets found" isDisabled />
        <MoreInfoTooltip>
          Make sure your spreadsheet contains at least a sheet with a header
          row. Also make sure your header row does not contain duplicates.
        </MoreInfoTooltip>
      </HStack>
    );
  return (
    <BasicSelect
      value={sheetId}
      items={(sheets ?? []).map((s) => ({ label: s.name, value: s.id }))}
      onChange={onSelectSheetId}
      placeholder={"Select the sheet"}
    />
  );
};
