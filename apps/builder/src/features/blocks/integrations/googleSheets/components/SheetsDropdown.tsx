import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { BasicSelect } from "@/components/inputs/BasicSelect";
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
  if (isLoading) return <Input value="Loading..." disabled />;
  if (!sheets || sheets.length === 0)
    return (
      <div className="flex items-center gap-2">
        <Input value="No sheets found" disabled />
        <MoreInfoTooltip>
          Make sure your spreadsheet contains at least a sheet with a header
          row. Also make sure your header row does not contain duplicates.
        </MoreInfoTooltip>
      </div>
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
