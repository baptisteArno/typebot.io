import { isDefined } from "@typebot.io/lib/utils";
import type { Log } from "@typebot.io/logs/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { CodeEditor } from "@/components/inputs/CodeEditor";
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
        {!isLoading && (logs ?? []).length === 0 && <p>No logs found.</p>}
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
            <div className="flex gap-3 items-start">
              <StatusTag status={log.status} className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2">
                <p>
                  {log.context && (
                    <span className="font-medium">{log.context}:</span>
                  )}{" "}
                  {log.description}
                </p>
              </div>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            <DetailsViewer details={log.details} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    );
  return (
    <div className="flex p-4 gap-3 items-start">
      <StatusTag status={log.status} className="shrink-0 mt-0.5" />
      <p>
        {log.context && <span className="font-medium">{log.context}:</span>}{" "}
        {log.description}
      </p>
    </div>
  );
};

const StatusTag = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  switch (status) {
    case "error":
      return (
        <Badge colorScheme={"red"} className={className}>
          Fail
        </Badge>
      );
    case "warning":
      return (
        <Badge colorScheme={"orange"} className={className}>
          Warn
        </Badge>
      );
    case "info":
      return (
        <Badge colorScheme={"blue"} className={className}>
          Info
        </Badge>
      );
    default:
      return (
        <Badge colorScheme={"green"} className={className}>
          Ok
        </Badge>
      );
  }
};

const DetailsViewer = ({ details }: { details: string }) => {
  const { formatted, isJson } = beautifyDetails(details);

  if (!isJson) {
    return (
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word p-4 font-mono text-sm">
        {formatted}
      </pre>
    );
  }

  return (
    <CodeEditor
      value={formatted}
      lang="json"
      isReadOnly
      withVariableButton={false}
      maxHeight="400px"
      withLineNumbers
    />
  );
};

const beautifyDetails = (details: string) => {
  try {
    const parsed = JSON.parse(details);
    return {
      formatted: JSON.stringify(parsed, null, 2),
      isJson: true,
    };
  } catch {
    return {
      formatted: details,
      isJson: false,
    };
  }
};
