import { ButtonLink } from "@/components/ButtonLink";
import { ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs";
import { Alert, AlertIcon, Stack, Text } from "@chakra-ui/react";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import React, { useRef } from "react";
import { HttpRequestAdvancedConfigForm } from "../../httpRequest/components/HttpRequestAdvancedConfigForm";

type Props = {
  block: PabblyConnectBlock;
  onOptionsChange: (options: PabblyConnectBlock["options"]) => void;
};

export const PabblyConnectSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

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
        <Alert status={url ? "success" : "info"} rounded="md">
          <AlertIcon />
          {url ? (
            <>Your scenario is correctly configured 🚀</>
          ) : (
            <Stack>
              <Text>Head up to Pabbly Connect to get the webhook URL:</Text>
              <ButtonLink
                href="https://www.pabbly.com/connect/integrations/typebot/"
                target="_blank"
              >
                Pabbly.com <ExternalLinkIcon />
              </ButtonLink>
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
