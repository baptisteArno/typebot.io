import type {
  HttpRequest,
  HttpRequestBlock,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import { useRef } from "react";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
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
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-4">
        <DebouncedTextInputWithVariablesButton
          placeholder="Paste URL..."
          defaultValue={options?.webhook?.url}
          onValueChange={updateUrl}
        />
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
