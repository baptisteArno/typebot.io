import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Spinner,
  Stack,
  Tag,
  type TagProps,
  Text,
  chakra,
} from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { Log } from "@typebot.io/logs/schemas";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useLogs } from "../hooks/useLogs";

type Props = {
  typebotId: string;
  resultId: string | null;
  onClose: () => void;
};
export const LogsDialog = ({ typebotId, resultId, onClose }: Props) => {
  const { isLoading, logs } = useLogs(typebotId, resultId);

  return (
    <Dialog.Root isOpen={isDefined(resultId)} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Logs</Dialog.Title>
        <Dialog.CloseButton />
        {logs?.map((log, idx) => (
          <LogCard key={idx} log={log} />
        ))}
        {isLoading && <Spinner />}
        {!isLoading && (logs ?? []).length === 0 && <Text>No logs found.</Text>}
      </Dialog.Popup>
    </Dialog.Root>
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
            <HStack gap={3} alignItems="flex-start">
              <StatusTag status={log.status} flexShrink={0} mt={0.5} />
              <Stack>
                <Text>
                  {log.context && (
                    <chakra.span fontWeight="medium">
                      {log.context}:
                    </chakra.span>
                  )}{" "}
                  {log.description}
                </Text>
              </Stack>
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
    <HStack p="4" gap={3} alignItems="flex-start">
      <StatusTag status={log.status} flexShrink={0} mt={0.5} />
      <Text>
        {log.context && (
          <chakra.span fontWeight="medium">{log.context}:</chakra.span>
        )}{" "}
        {log.description}
      </Text>
    </HStack>
  );
};

const StatusTag = ({ status, ...tagProps }: { status: string } & TagProps) => {
  switch (status) {
    case "error":
      return (
        <Tag colorScheme={"red"} {...tagProps}>
          Fail
        </Tag>
      );
    case "warning":
      return (
        <Tag colorScheme={"orange"} {...tagProps}>
          Warn
        </Tag>
      );
    case "info":
      return (
        <Tag colorScheme={"blue"} {...tagProps}>
          Info
        </Tag>
      );
    default:
      return (
        <Tag colorScheme={"green"} {...tagProps}>
          Ok
        </Tag>
      );
  }
};
