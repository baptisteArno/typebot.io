import { HStack, Text } from "@chakra-ui/react";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { HeaderIcon } from "../components/HeaderIcon";
import type { HeaderCell } from "../types";

export const parseHeaderCells = (
  resultHeader: ResultHeaderCell[],
): HeaderCell[] =>
  resultHeader.map((header) => ({
    Header: (
      <HStack minW="150px" maxW="500px">
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
    ),
    accessor: header.id,
  }));
