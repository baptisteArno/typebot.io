import { Box, type BoxProps } from "@chakra-ui/react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { TableData } from "@typebot.io/results/schemas/results";

type Props = {
  headerGroup: HeaderGroup<TableData>;
};

export const HeaderRow = ({ headerGroup }: Props) => {
  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return (
          <th
            key={header.id}
            style={
              {
                "--size": header.getSize() + "px",
              } as React.CSSProperties
            }
            className="px-4 py-3 bg-gray-1 z-10 sticky top-0 font-normal whitespace-nowrap word-break-normal border-t border-b border-r first:border-l"
            colSpan={header.colSpan}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
            {header.column.getCanResize() && (
              <ResizeHandle
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
              />
            )}
          </th>
        );
      })}
    </tr>
  );
};

const ResizeHandle = (props: BoxProps) => {
  return (
    <Box
      pos="absolute"
      right="-5px"
      w="10px"
      h="full"
      top="0"
      cursor="col-resize"
      userSelect="none"
      data-testid="resize-handle"
      {...props}
    />
  );
};
