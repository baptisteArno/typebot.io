import { CalendarIcon, CodeIcon } from "@/components/icons";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";

export const HeaderIcon = ({ header }: { header: ResultHeaderCell }) =>
  header.blockType ? (
    <BlockIcon type={header.blockType} />
  ) : header.variableIds ? (
    <CodeIcon />
  ) : (
    <CalendarIcon />
  );
