import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { TableData } from "@typebot.io/results/schemas/results";
import { cn } from "@typebot.io/ui/lib/cn";

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

const ResizeHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "absolute w-[10px] h-full right-[-5px] top-0 cursor-col-resize select-none",
        className,
      )}
      data-testid="resize-handle"
      {...props}
    />
  );
};
