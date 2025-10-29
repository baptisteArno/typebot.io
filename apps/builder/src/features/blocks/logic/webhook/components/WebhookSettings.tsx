import * as Sentry from "@sentry/nextjs";
import type { ResponseVariableMapping } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { WebhookBlock } from "@typebot.io/blocks-logic/webhook/schema";
import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Tabs } from "@typebot.io/ui/components/Tabs";
import usePartySocket from "partysocket/react";
import { useMemo, useState } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { CopyInput } from "@/components/inputs/CopyInput";
import { TableList, type TableListItemProps } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { DataVariableInputs } from "@/features/blocks/integrations/httpRequest/components/ResponseMappingInputs";
import { computeDeepKeysMappingSuggestionList } from "@/features/blocks/integrations/httpRequest/helpers/computeDeepKeysMappingSuggestionList";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { toast } from "@/lib/toast";

type Props = {
  blockId: string;
  options: WebhookBlock["options"];
  onOptionsChange: (options: WebhookBlock["options"]) => void;
};

export const WebhookSettings = ({
  blockId,
  options,
  onOptionsChange,
}: Props) => {
  const { typebot, save } = useTypebot();
  const { user } = useUser();
  const [receivedData, setReceivedData] = useState<string>();
  const [websocketStatus, setWebsocketStatus] = useState<"closed" | "opened">(
    "closed",
  );
  const [responseKeys, setResponseKeys] = useState<string[]>();

  const updateResponseVariableMapping = (
    responseVariableMapping: ResponseVariableMapping[],
  ) => onOptionsChange({ ...options, responseVariableMapping });

  const ws = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: `${user?.id}/${typebot?.id}/webhooks`,

    async onMessage(e) {
      try {
        const parsedData = JSON.parse(e.data);
        if (Object.keys(parsedData).length > 0) {
          setReceivedData(JSON.stringify(parsedData, null, 2));
          setResponseKeys(computeDeepKeysMappingSuggestionList(parsedData));
        }
        setWebsocketStatus("closed");
        ws.close();
      } catch (err) {
        toast(await parseUnknownError({ err }));
      }
    },
    async onError(e) {
      console.error(e);
      console.log((await parseUnknownError({ err: e })).details);
      Sentry.captureException(e);
    },
    startClosed: true,
  });

  const listenForTestEvent = async () => {
    await save();
    ws.reconnect();
    setReceivedData(undefined);
    setResponseKeys(undefined);
    setWebsocketStatus("opened");
  };

  const ResponseMappingInputs = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <DataVariableInputs {...props} dataItems={responseKeys ?? []} />;
      },
    [responseKeys],
  );

  const urlBase = typebot
    ? `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/v1/typebots/${typebot.id}/blocks/${blockId}`
    : "";

  return (
    <Tabs.Root defaultValue="test">
      <Tabs.List>
        <Tabs.Tab value="test">Test URL</Tabs.Tab>
        <Tabs.Tab value="production">Production URL</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="test">
        <div className="flex flex-col gap-4">
          {typebot && <CopyInput value={`${urlBase}/web/executeTestWebhook`} />}
          <Button
            onClick={listenForTestEvent}
            disabled={websocketStatus === "opened"}
          >
            Listen for test event
          </Button>
          {websocketStatus === "opened" && (
            <div className="flex flex-col border p-4 rounded-md gap-3">
              <p className="text-sm">
                Waiting for an{" "}
                <TextLink
                  href={"https://docs.typebot.io/api-reference/authentication"}
                  isExternal
                >
                  authenticated
                </TextLink>{" "}
                <Badge>POST</Badge> request to the Test URL...
              </p>
            </div>
          )}
          {receivedData && (
            <CodeEditor isReadOnly lang="json" value={receivedData} />
          )}
          {(receivedData ||
            (options?.responseVariableMapping &&
              options.responseVariableMapping.length > 0)) && (
            <Accordion.Root>
              <Accordion.Item>
                <Accordion.Trigger>Save in variables</Accordion.Trigger>
                <Accordion.Panel>
                  <TableList<ResponseVariableMapping>
                    initialItems={options?.responseVariableMapping}
                    onItemsChange={updateResponseVariableMapping}
                    addLabel="Add an entry"
                  >
                    {(props) => <ResponseMappingInputs {...props} />}
                  </TableList>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          )}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="production">
        {typebot && (
          <Field.Root>
            <CopyInput value={`${urlBase}/results/{resultId}/executeWebhook`} />
            <Field.Description>
              You can easily get the Result ID{" "}
              <TextLink
                isExternal
                href="https://docs.typebot.io/editor/blocks/logic/set-variable#result-id"
              >
                with a Set variable block
              </TextLink>
              .
            </Field.Description>
          </Field.Root>
        )}
      </Tabs.Panel>
    </Tabs.Root>
  );
};
