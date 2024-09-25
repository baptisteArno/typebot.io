import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import React from "react";
import { useResults } from "../ResultsProvider";
import { HeaderIcon } from "./HeaderIcon";

type Props = {
  resultId: string | null;
  onClose: () => void;
};

export const ResultModal = ({ resultId, onClose }: Props) => {
  const { tableData, resultHeader } = useResults();
  const { typebot } = useTypebot();
  const result = isDefined(resultId)
    ? tableData.find((data) => data.id.plainText === resultId)
    : undefined;

  const columnsOrder = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader,
  );

  const getHeaderValue = (
    val: string | { plainText: string; element?: JSX.Element | undefined },
  ) => (typeof val === "string" ? val : (val.element ?? val.plainText));

  return (
    <Modal isOpen={isDefined(result)} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} p="10" spacing="10">
          {columnsOrder.map((headerId) => {
            if (!result || !result[headerId]) return null;
            const header = resultHeader.find(byId(headerId));
            if (!header) return null;
            return (
              <Stack key={header.id} spacing="4">
                <HStack>
                  <HeaderIcon header={header} />
                  <Heading fontSize="md">{header.label}</Heading>
                </HStack>
                <Text whiteSpace="pre-wrap" textAlign="justify">
                  {getHeaderValue(result[header.id])}
                </Text>
              </Stack>
            );
          })}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
