import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Box,
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { byId, isDefined } from "@typebot.io/lib/utils";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import React, { useState } from "react";
import { useResults } from "../ResultsProvider";
import { useResultTranscriptQuery } from "../hooks/useResultTranscriptQuery";
import { HeaderIcon } from "./HeaderIcon";

type Props = {
  resultId: string | null;
  onClose: () => void;
};

export const ResultModal = ({ resultId, onClose }: Props) => {
  const hostBubbleBgColor = useColorModeValue("gray.100", "gray.900");
  const hostBubbleColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("white", "gray.950");
  const [tab, setTab] = useState<"transcript" | "answers">("transcript");
  const { tableData, resultHeader } = useResults();
  const { typebot } = useTypebot();
  const result = isDefined(resultId)
    ? tableData.find((data) => data.id.plainText === resultId)
    : undefined;

  const { data: transcriptData, isLoading: isTranscriptLoading } =
    useResultTranscriptQuery({
      typebotId: typebot?.id ?? "",
      resultId: resultId ?? "",
      enabled: isDefined(resultId) && isDefined(typebot?.id),
    });

  const columnsOrder = parseColumnsOrder(
    typebot?.resultsTablePreferences?.columnsOrder,
    resultHeader,
  );

  const getHeaderValue = (
    val: string | { plainText: string; element?: JSX.Element | undefined },
  ) => (typeof val === "string" ? val : (val.element ?? val.plainText));

  const renderTranscriptMessage = (message: any, index: number) => {
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
  };

  if (isTranscriptLoading)
    return (
      <Stack align="center" py={8}>
        <Spinner />
        <Text>Loading transcript...</Text>
      </Stack>
    );
  return (
    <Modal isOpen={isDefined(result)} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} p="6" spacing="6">
          <HStack>
            <Button
              variant={tab === "transcript" ? "outline" : "ghost"}
              onClick={() => setTab("transcript")}
              colorScheme={tab === "transcript" ? "orange" : "gray"}
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
              colorScheme={tab === "answers" ? "orange" : "gray"}
              size="sm"
            >
              Answers
            </Button>
          </HStack>

          {tab === "transcript" && (
            <Box borderWidth={1} borderRadius="md" p={4} bg={bgColor}>
              {transcriptData?.transcript.map(renderTranscriptMessage)}
            </Box>
          )}
          {tab === "answers" && (
            <Stack spacing="6">
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
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
