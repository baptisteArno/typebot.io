import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { Log } from "@typebot.io/results/schemas/results";
import { useLogs } from "../hooks/useLogs";

type Props = {
  typebotId: string;
  resultId: string | null;
  onClose: () => void;
};
export const LogsModal = ({ typebotId, resultId, onClose }: Props) => {
  const { isLoading, logs } = useLogs(typebotId, resultId);

  return (
    <Modal isOpen={isDefined(resultId)} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Logs</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack}>
          {logs?.map((log, idx) => (
            <LogCard key={idx} log={log} />
          ))}
          {isLoading && <Spinner />}
          {!isLoading && (logs ?? []).length === 0 && (
            <Text>No logs found.</Text>
          )}
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

const LogCard = ({ log }: { log: Log }) => {
  if (log.details)
    return (
      <Accordion allowToggle>
        <AccordionItem style={{ borderBottomWidth: 0, borderWidth: 0 }}>
          <AccordionButton
            as={HStack}
            p="4"
            cursor="pointer"
            justifyContent="space-between"
            borderRadius="md"
          >
            <HStack>
              <StatusTag status={log.status} />
              <Text>{log.description}</Text>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel
            as="pre"
            overflow="auto"
            borderWidth="1px"
            borderRadius="md"
          >
            {log.details}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  return (
    <HStack p="4">
      <StatusTag status={log.status} />
      <Text>{log.description}</Text>
    </HStack>
  );
};

const StatusTag = ({ status }: { status: string }) => {
  switch (status) {
    case "error":
      return <Tag colorScheme={"red"}>Fail</Tag>;
    case "warning":
      return <Tag colorScheme={"orange"}>Warn</Tag>;
    case "info":
      return <Tag colorScheme={"blue"}>Info</Tag>;
    default:
      return <Tag colorScheme={"green"}>Ok</Tag>;
  }
};
