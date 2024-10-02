import { ExternalLinkIcon } from "@/components/icons";
import { Alert, AlertIcon, Button, Link, Stack, Text } from "@chakra-ui/react";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import React from "react";
import { HttpRequestAdvancedConfigForm } from "../../httpRequest/components/HttpRequestAdvancedConfigForm";

type Props = {
  block: MakeComBlock;
  onOptionsChange: (options: MakeComBlock["options"]) => void;
};

export const MakeComSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    });
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
            <Text>Head up to Make.com to configure this block:</Text>
            <Button
              as={Link}
              href="https://www.make.com/en/integrations/typebot"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Make.com</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
      <HttpRequestAdvancedConfigForm
        blockId={blockId}
        httpRequest={options?.webhook}
        options={options}
        onHttpRequestChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  );
};
