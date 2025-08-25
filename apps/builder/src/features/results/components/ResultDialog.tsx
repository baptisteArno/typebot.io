import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Box,
  HStack,
  Heading,
  Spinner,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import type {
  ResultHeaderCell,
  TableData,
} from "@typebot.io/results/schemas/results";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import React, { useState } from "react";
import { useResults } from "../ResultsProvider";
import { useResultTranscriptQuery } from "../hooks/useResultTranscriptQuery";
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

        <HStack>
          <Button
            variant={tab === "transcript" ? "outline" : "ghost"}
            onClick={() => setTab("transcript")}
            size="sm"
          >
            Transcript
            <Tag size="sm" colorScheme="orange" ml={1}>
              Beta
            </Tag>
          </Button>
          <Button
            variant={tab === "answers" ? "outline" : "ghost"}
            onClick={() => setTab("answers")}
            size="sm"
          >
            Answers
          </Button>
        </HStack>
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
  const hostBubbleBgColor = useColorModeValue("gray.100", "gray.900");
  const hostBubbleColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("white", "gray.950");

  const { data: transcriptData, isLoading: isTranscriptLoading } =
    useResultTranscriptQuery({
      typebotId,
      resultId,
    });

  if (isTranscriptLoading)
    return (
      <Stack align="center" py={8}>
        <Spinner />
        <Text>Loading transcript...</Text>
      </Stack>
    );

  return (
    <Box borderWidth={1} borderRadius="md" p={4} bg={bgColor}>
      {transcriptData?.transcript.map((message: any, index: number) => {
        const isBot = message.role === "bot";
        const content =
          message.text || message.image || message.video || message.audio || "";

        return (
          <HStack
            key={index}
            justify={isBot ? "flex-start" : "flex-end"}
            w="full"
            mb={2}
          >
            <Box
              maxW="70%"
              bg={isBot ? hostBubbleBgColor : "orange.500"}
              color={isBot ? hostBubbleColor : "white"}
              borderWidth={1}
              px={3}
              py={2}
              borderRadius="lg"
              borderBottomLeftRadius={isBot ? "sm" : "lg"}
              borderBottomRightRadius={isBot ? "lg" : "sm"}
            >
              <Text whiteSpace="pre-wrap" fontSize="sm">
                {message.type === "text"
                  ? content
                  : `[${message.type.toUpperCase()}] ${content}`}
              </Text>
            </Box>
          </HStack>
        );
      })}
    </Box>
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
      <Stack key={header.id} spacing="4">
        <HStack>
          <HeaderIcon header={header} />
          <Heading fontSize="md">{header.label}</Heading>
        </HStack>
        <Text whiteSpace="pre-wrap" textAlign="justify">
          {getHeaderValue(tableData[header.id])}
        </Text>
      </Stack>
    );
  });
};
