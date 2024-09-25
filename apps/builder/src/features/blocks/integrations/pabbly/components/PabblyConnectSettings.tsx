import { ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs";
import { Alert, AlertIcon, Button, Link, Stack, Text } from "@chakra-ui/react";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import type { HttpRequest } from "@typebot.io/blocks-integrations/webhook/schema";
import React from "react";
import { HttpRequestAdvancedConfigForm } from "../../webhook/components/HttpRequestAdvancedConfigForm";

type Props = {
  block: PabblyConnectBlock;
  onOptionsChange: (options: PabblyConnectBlock["options"]) => void;
};

export const PabblyConnectSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    });
  };

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } });
  };

  const url = options?.webhook?.url;

  return (
    <Stack spacing={4}>
      <Alert status={url ? "success" : "info"} rounded="md">
        <AlertIcon />
        {url ? (
          <>Your scenario is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Pabbly Connect to get the webhook URL:</Text>
            <Button
              as={Link}
              href="https://www.pabbly.com/connect/integrations/typebot/"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Pabbly.com</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={url ?? ""}
        onChange={updateUrl}
        withVariableButton={false}
        debounceTimeout={0}
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
