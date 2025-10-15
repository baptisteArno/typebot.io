import {
  chakra,
  HStack,
  Stack,
  Tag,
  type TagProps,
  Text,
} from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { Log } from "@typebot.io/logs/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
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
        {isLoading && <LoaderCircleIcon className="animate-spin" />}
        {!isLoading && (logs ?? []).length === 0 && <Text>No logs found.</Text>}
      </Dialog.Popup>
    </Dialog.Root>
  );
};

const LogCard = ({ log }: { log: Log }) => {
  if (log.details)
    return (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
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
          </Accordion.Trigger>
          <Accordion.Panel>{log.details}</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
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
