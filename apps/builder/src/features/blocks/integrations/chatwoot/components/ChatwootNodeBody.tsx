import type { ChatwootBlock } from "@typebot.io/blocks-integrations/chatwoot/schema";

type Props = {
  block: ChatwootBlock;
};

export const ChatwootNodeBody = ({ block }: Props) =>
  block.options?.task === "Close widget" ? (
    <p>Close Chatwoot</p>
  ) : (block.options?.websiteToken?.length ?? 0) === 0 ? (
    <p color="gray.500">Configure...</p>
  ) : (
    <p>Open Chatwoot</p>
  );
