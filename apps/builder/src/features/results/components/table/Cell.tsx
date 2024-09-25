import { ExpandIcon } from "@/components/icons";
import { Button, Fade, chakra, useColorModeValue } from "@chakra-ui/react";
import { type Cell as CellProps, flexRender } from "@tanstack/react-table";
import type { TableData } from "@typebot.io/results/schemas/results";
import { memo } from "react";

type Props = {
  cell: CellProps<TableData, unknown>;
  size: number;
  isExpandButtonVisible: boolean;
  rowIndex: number;
  cellIndex: number;
  isSelected: boolean;
  onExpandButtonClick: () => void;
};

const Cell = ({
  cell,
  size,
  isExpandButtonVisible,
  rowIndex,
  cellIndex,
  onExpandButtonClick,
}: Props) => {
  return (
    <chakra.td
      key={cell.id}
      px="4"
      py="2"
      borderWidth={rowIndex === 0 ? "0 1px 1px 1px" : "1px"}
      borderColor={useColorModeValue("gray.200", "gray.700")}
      whiteSpace="pre-wrap"
      pos="relative"
      style={{
        minWidth: size,
        maxWidth: size,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
      <chakra.span
        pos="absolute"
        top="0"
        right={2}
        h="full"
        display="inline-flex"
        alignItems="center"
      >
        <Fade unmountOnExit in={isExpandButtonVisible && cellIndex === 1}>
          <Button
            leftIcon={<ExpandIcon />}
            shadow="lg"
            size="xs"
            onClick={onExpandButtonClick}
          >
            Open
          </Button>
        </Fade>
      </chakra.span>
    </chakra.td>
  );
};

export default memo(
  Cell,
  (prev, next) =>
    prev.size === next.size &&
    prev.isExpandButtonVisible === next.isExpandButtonVisible &&
    prev.isSelected === next.isSelected,
);
