import type {
  HttpRequest,
  HttpRequestBlock,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { ZapierBlock } from "@typebot.io/blocks-integrations/zapier/schema";
import { Alert } from "@typebot.io/ui/components/Alert";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useRef } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { HttpRequestAdvancedConfigForm } from "../../httpRequest/components/HttpRequestAdvancedConfigForm";

type Props = {
  block: ZapierBlock;
  onOptionsChange: (options: HttpRequestBlock["options"]) => void;
};

export const ZapierSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    });
    return;
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
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-4">
        {url ? (
          <Alert.Root variant="success">
            <CheckmarkSquare02Icon />
            <Alert.Description>
              Your zap is correctly configured 🚀
            </Alert.Description>
          </Alert.Root>
        ) : (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              Head up to Zapier to configure this block:
            </Alert.Description>
            <Alert.Action>
              <ButtonLink
                variant="secondary"
                href="https://zapier.com/apps/typebot/integrations"
                target="_blank"
                size="xs"
              >
                Zapier <ArrowUpRight01Icon />
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
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
