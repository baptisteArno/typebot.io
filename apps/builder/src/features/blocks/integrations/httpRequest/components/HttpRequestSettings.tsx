import { TextInput } from "@/components/inputs";
import { Stack } from "@chakra-ui/react";
import type {
  HttpRequest,
  HttpRequestBlock,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import React, { useRef } from "react";
import { HttpRequestAdvancedConfigForm } from "./HttpRequestAdvancedConfigForm";

type Props = {
  block: HttpRequestBlock;
  onOptionsChange: (options: HttpRequestBlock["options"]) => void;
};

export const HttpRequestSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({ ...options, webhook: newLocalWebhook });
  };

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } });
  };

  const handleNewTestResponse = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  return (
    <Stack spacing={0}>
      <Stack spacing={4}>
        <TextInput
          placeholder="Paste URL..."
          defaultValue={options?.webhook?.url}
          onChange={updateUrl}
        />
        <HttpRequestAdvancedConfigForm
          blockId={blockId}
          httpRequest={options?.webhook}
          options={options}
          onHttpRequestChange={setLocalWebhook}
          onOptionsChange={onOptionsChange}
          onNewTestResponse={handleNewTestResponse}
        />
      </Stack>
      <div ref={bottomRef} />
    </Stack>
  );
};
