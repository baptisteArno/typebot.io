import {
  Box,
  type BoxProps,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { TableData } from "@typebot.io/results/schemas/results";
import { colors } from "@typebot.io/ui/chakraTheme";

type Props = {
  headerGroup: HeaderGroup<TableData>;
};

export const HeaderRow = ({ headerGroup }: Props) => {
  const borderColor = useColorModeValue(colors.gray[200], colors.gray[700]);
  const backgroundColor = useColorModeValue("white", colors.gray[900]);

  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return (
          <chakra.th
            key={header.id}
            px="4"
            py="3"
            borderX="1px"
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            zIndex={1}
            pos="sticky"
            top="0"
            fontWeight="normal"
            whiteSpace="nowrap"
            wordBreak="normal"
            colSpan={header.colSpan}
            shadow={`inset 0 1px 0 ${borderColor}, inset 0 -1px 0 ${borderColor}; `}
            style={{
              minWidth: header.getSize(),
              maxWidth: header.getSize(),
            }}
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
          </chakra.th>
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
