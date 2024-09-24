import { TextInput } from "@/components/inputs";
import { Stack } from "@chakra-ui/react";
import type {
  HttpRequest,
  HttpRequestBlock,
} from "@typebot.io/blocks-integrations/webhook/schema";
import React from "react";
import { HttpRequestAdvancedConfigForm } from "./HttpRequestAdvancedConfigForm";

type Props = {
  block: HttpRequestBlock;
  onOptionsChange: (options: HttpRequestBlock["options"]) => void;
};

export const HttpRequestSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({ ...options, webhook: newLocalWebhook });
  };

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste URL..."
        defaultValue={options?.webhook?.url}
        onChange={updateUrl}
      />
      <HttpRequestAdvancedConfigForm
        blockId={blockId}
        webhook={options?.webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  );
};
