import { Stack } from "@chakra-ui/react";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import { Alert } from "@typebot.io/ui/components/Alert";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useRef } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { ExternalLinkIcon } from "@/components/icons";
import { HttpRequestAdvancedConfigForm } from "../../httpRequest/components/HttpRequestAdvancedConfigForm";

type Props = {
  block: MakeComBlock;
  onOptionsChange: (options: MakeComBlock["options"]) => void;
};

export const MakeComSettings = ({
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
          <Alert.Root variant="info">
            <InformationSquareIcon />
            <Alert.Description>
              Head up to Make.com to configure this block
            </Alert.Description>
            <Alert.Action>
              <ButtonLink
                size="xs"
                variant="secondary"
                href="https://www.make.com/en/integrations/typebot"
                target="_blank"
              >
                Make.com <ExternalLinkIcon />
              </ButtonLink>
            </Alert.Action>
          </Alert.Root>
        )}
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
