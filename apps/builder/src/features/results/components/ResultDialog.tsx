import { byId, isDefined } from "@typebot.io/lib/utils";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import type {
  ResultHeaderCell,
  TableData,
} from "@typebot.io/results/schemas/results";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { type JSX, useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useResultTranscriptQuery } from "../hooks/useResultTranscriptQuery";
import { useResults } from "../ResultsProvider";
import { HeaderIcon } from "./HeaderIcon";

type Props = {
  resultId: string | null;
  onClose: () => void;
};

export const ResultDialog = ({ resultId, onClose }: Props) => {
  const [tab, setTab] = useState<"transcript" | "answers">("transcript");
  const { tableData, resultHeader } = useResults();
  const { typebot } = useTypebot();
  const result = isDefined(resultId)
    ? tableData.find((data) => data.id.plainText === resultId)
    : undefined;

  return (
    <Dialog.Root isOpen={isDefined(result)} onClose={onClose}>
      <Dialog.Popup className="max-w-2xl">
        <Dialog.Title>Result</Dialog.Title>
        <Dialog.CloseButton />

        <div className="flex items-center gap-2">
          <Button
            variant={tab === "transcript" ? "outline" : "ghost"}
            onClick={() => setTab("transcript")}
            size="sm"
          >
            Transcript
            <Badge colorScheme="orange" className="ml-1">
              Beta
            </Badge>
          </Button>
          <Button
            variant={tab === "answers" ? "outline" : "ghost"}
            onClick={() => setTab("answers")}
            size="sm"
          >
            Answers
          </Button>
        </div>
        {tab === "transcript" && typebot?.id && resultId && (
          <Transcript typebotId={typebot?.id} resultId={resultId} />
        )}
        {tab === "answers" && typebot?.id && result && (
          <Answers
            typebot={typebot}
            tableData={result}
            resultHeader={resultHeader}
          />
        )}
      </Dialog.Popup>
    </Dialog.Root>
  );
};

const Transcript = ({
  typebotId,
  resultId,
}: {
  typebotId: string;
  resultId: string;
}) => {
  const { data: transcriptData, isLoading: isTranscriptLoading } =
    useResultTranscriptQuery({
      typebotId,
      resultId,
    });

  if (isTranscriptLoading)
    return (
      <div className="flex flex-col gap-2 items-center py-8">
        <LoaderCircleIcon className="animate-spin" />
        <p>Loading transcript...</p>
      </div>
    );

  return (
    <div className="border rounded-md p-4 bg-gray-1">
      {transcriptData?.transcript.map((message: any, index: number) => {
        const isBot = message.role === "bot";
        const content =
          message.text || message.image || message.video || message.audio || "";

        return (
          <div
            className={cx(
              "flex items-center gap-2 w-full mb-2",
              isBot ? "justify-start" : "justify-end",
            )}
            key={index}
          >
            <div
              className={cx(
                "max-w-[70%] border px-3 py-2 rounded-lg",
                isBot
                  ? "bg-gray-3 text-gray-12 rounded-bl-sm rounded-br-lg"
                  : "bg-orange-9 text-white rounded-bl-lg rounded-br-sm",
              )}
            >
              <p className="text-sm whitespace-pre-wrap overflow-hidden">
                {message.type === "text"
                  ? content
                  : `[${message.type.toUpperCase()}] ${content}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Answers = ({
  typebot,
  tableData,
  resultHeader,
}: {
  typebot: TypebotV6;
  tableData: TableData;
  resultHeader: ResultHeaderCell[];
}) => {
  const columnsOrder = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader,
  );

  const getHeaderValue = (
    val: string | { plainText: string; element?: JSX.Element | undefined },
  ) => (typeof val === "string" ? val : (val.element ?? val.plainText));

  return columnsOrder.map((headerId) => {
    if (!tableData || !tableData[headerId]) return null;
    const header = resultHeader.find(byId(headerId));
    if (!header) return null;
    return (
      <div className="flex flex-col gap-4" key={header.id}>
        <div className="flex items-center gap-2">
          <HeaderIcon header={header} />
          <h3 className="text-md">{header.label}</h3>
        </div>
        <p className="text-justify whitespace-pre-wrap">
          {getHeaderValue(tableData[header.id])}
        </p>
      </div>
    );
  });
};
