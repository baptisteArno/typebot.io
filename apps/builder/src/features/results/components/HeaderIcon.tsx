import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { AlarmClockIcon } from "@typebot.io/ui/icons/AlarmClockIcon";
import { SourceCodeIcon } from "@typebot.io/ui/icons/SourceCodeIcon";
import { BlockIcon } from "@/features/editor/components/BlockIcon";

export const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableIds ? (
    <SourceCodeIcon />
  ) : (
    <AlarmClockIcon />
  );
