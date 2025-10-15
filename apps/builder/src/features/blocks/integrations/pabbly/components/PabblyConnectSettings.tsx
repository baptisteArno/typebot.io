import { Stack } from "@chakra-ui/react";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import { Alert } from "@typebot.io/ui/components/Alert";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useRef } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { ExternalLinkIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs/TextInput";
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
        {url ? (
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <Alert.Description>
              Your scenario is correctly configured 🚀
            </Alert.Description>
          </Alert.Root>
        ) : (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              Head up to Pabbly Connect to get the webhook URL:
            </Alert.Description>
            <Alert.Action>
              <ButtonLink
                variant="secondary"
                href="https://www.pabbly.com/connect/integrations/typebot/"
                target="_blank"
                size="xs"
              >
                Pabbly.com <ExternalLinkIcon />
              </ButtonLink>
            </Alert.Action>
          </Alert.Root>
        )}
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
