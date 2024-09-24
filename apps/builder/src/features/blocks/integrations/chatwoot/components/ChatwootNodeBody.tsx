import { Text } from "@chakra-ui/react";
import type { ChatwootBlock } from "@typebot.io/blocks-integrations/chatwoot/schema";

type Props = {
  block: ChatwootBlock;
};

export const ChatwootNodeBody = ({ block }: Props) =>
  block.options?.task === "Close widget" ? (
    <Text>Close Chatwoot</Text>
  ) : (block.options?.websiteToken?.length ?? 0) === 0 ? (
    <Text color="gray.500">Configure...</Text>
  ) : (
    <Text>Open Chatwoot</Text>
  );
