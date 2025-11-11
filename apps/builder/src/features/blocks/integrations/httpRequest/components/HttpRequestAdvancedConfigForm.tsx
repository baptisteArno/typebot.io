import {
  defaultHttpRequestAttributes,
  defaultHttpRequestBlockOptions,
  defaultTimeout,
  HttpMethod,
  maxTimeout,
} from "@typebot.io/blocks-integrations/httpRequest/constants";
import type {
  HttpRequest,
  HttpRequestBlock,
  KeyValue,
  ResponseVariableMapping,
  VariableForTest,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useMemo, useState } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TableList, type TableListItemProps } from "@/components/TableList";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { computeDeepKeysMappingSuggestionList } from "../helpers/computeDeepKeysMappingSuggestionList";
import { convertVariablesForTestToVariables } from "../helpers/convertVariablesForTestToVariables";
import { HeadersInputs, QueryParamsInputs } from "./KeyValueInputs";
import { DataVariableInputs } from "./ResponseMappingInputs";
import { VariableForTestInputs } from "./VariableForTestInputs";

type Props = {
  blockId: string;
  httpRequest: HttpRequest | undefined;
  options: HttpRequestBlock["options"];
  onHttpRequestChange: (httpRequest: HttpRequest) => void;
  onOptionsChange: (options: HttpRequestBlock["options"]) => void;
  onNewTestResponse?: () => void;
};

export const HttpRequestAdvancedConfigForm = ({
  blockId,
  httpRequest,
  options,
  onHttpRequestChange,
  onOptionsChange,
  onNewTestResponse,
}: Props) => {
  const { typebot, save } = useTypebot();
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string>();
  const [responseKeys, setResponseKeys] = useState<string[]>([]);

  const updateMethod = (method: HttpMethod | undefined) =>
    onHttpRequestChange({ ...httpRequest, method });

  const updateQueryParams = (queryParams: KeyValue[]) =>
    onHttpRequestChange({ ...httpRequest, queryParams });

  const updateHeaders = (headers: KeyValue[]) =>
    onHttpRequestChange({ ...httpRequest, headers });

  const updateBody = (body: string) =>
    onHttpRequestChange({ ...httpRequest, body });

  const updateVariablesForTest = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...options, variablesForTest });

  const updateResponseVariableMapping = (
    responseVariableMapping: ResponseVariableMapping[],
  ) => onOptionsChange({ ...options, responseVariableMapping });

  const updateIsCustomBody = (isCustomBody: boolean) =>
    onOptionsChange({ ...options, isCustomBody });

  const updateTimeout = (timeout: number | undefined) =>
    onOptionsChange({ ...options, timeout });

  const executeTestRequest = async () => {
    if (!typebot) return;
    setIsTestResponseLoading(true);
    await save();
    try {
      const data = await trpcClient.httpRequest.testHttpRequest.mutate({
        typebotId: typebot.id,
        blockId: blockId,
        variables: convertVariablesForTestToVariables(
          options?.variablesForTest ?? [],
          typebot.variables,
        ),
      });
      setTestResponse(JSON.stringify(data, undefined, 2));
      setResponseKeys(computeDeepKeysMappingSuggestionList(data));
      onNewTestResponse?.();
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unknown error",
        title: "While testing HTTP request",
      });
    }
    setIsTestResponseLoading(false);
  };

  const updateIsExecutedOnClient = (isExecutedOnClient: boolean) =>
    onOptionsChange({ ...options, isExecutedOnClient });

  const ResponseMappingInputs = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <DataVariableInputs {...props} dataItems={responseKeys} />;
      },
    [responseKeys],
  );

  const updateProxyCredentialsId = (proxyCredentialsId: string | undefined) =>
    onOptionsChange({ ...options, proxyCredentialsId });

  const isCustomBody =
    options?.isCustomBody ?? defaultHttpRequestBlockOptions.isCustomBody;

  return (
    <>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>Advanced configuration</Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root className="flex-row items-center">
              <Switch
                checked={
                  options?.isExecutedOnClient ??
                  defaultHttpRequestBlockOptions.isExecutedOnClient
                }
                onCheckedChange={updateIsExecutedOnClient}
              />
              <Field.Label>
                Execute on client{" "}
                <MoreInfoTooltip>
                  If enabled, the httpRequest will be executed on the client. It
                  means it will be executed in the browser of your visitor. Make
                  sure to enable CORS and do not expose sensitive data.
                </MoreInfoTooltip>
              </Field.Label>
            </Field.Root>
            <div className="flex items-center gap-2 justify-between">
              <p>Method:</p>
              <BasicSelect
                value={httpRequest?.method}
                defaultValue={defaultHttpRequestAttributes.method}
                onChange={updateMethod}
                items={Object.values(HttpMethod)}
              />
            </div>
            <Accordion.Root>
              <Accordion.Item>
                <Accordion.Trigger>Query params</Accordion.Trigger>
                <Accordion.Panel>
                  <TableList<KeyValue>
                    initialItems={httpRequest?.queryParams}
                    onItemsChange={updateQueryParams}
                    addLabel="Add a param"
                  >
                    {(props) => <QueryParamsInputs {...props} />}
                  </TableList>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item>
                <Accordion.Trigger>Headers</Accordion.Trigger>
                <Accordion.Panel>
                  <TableList<KeyValue>
                    initialItems={httpRequest?.headers}
                    onItemsChange={updateHeaders}
                    addLabel="Add a value"
                  >
                    {(props) => <HeadersInputs {...props} />}
                  </TableList>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item>
                <Accordion.Trigger>Body</Accordion.Trigger>
                <Accordion.Panel>
                  <Field.Root className="flex-row items-center">
                    <Switch
                      checked={isCustomBody}
                      onCheckedChange={updateIsCustomBody}
                    />
                    <Field.Label>Custom body</Field.Label>
                  </Field.Root>
                  {isCustomBody && (
                    <CodeEditor
                      defaultValue={httpRequest?.body}
                      lang="json"
                      onChange={updateBody}
                      debounceTimeout={0}
                      withLineNumbers={true}
                    />
                  )}
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item>
                <Accordion.Trigger>Advanced parameters</Accordion.Trigger>
                <Accordion.Panel>
                  {typebot && (
                    <CredentialsDropdown
                      type="http proxy"
                      hideIfNoCredentials
                      scope={{
                        type: "workspace",
                        workspaceId: typebot.workspaceId,
                      }}
                      currentCredentialsId={options?.proxyCredentialsId}
                      onCredentialsSelect={updateProxyCredentialsId}
                      onCreateNewClick={undefined}
                      credentialsName="HTTP proxy"
                    />
                  )}
                  <Field.Root className="flex-row">
                    <Field.Label>Timeout (s)</Field.Label>
                    <BasicNumberInput
                      defaultValue={options?.timeout ?? defaultTimeout}
                      min={1}
                      max={maxTimeout}
                      onValueChange={updateTimeout}
                      withVariableButton={false}
                    />
                  </Field.Root>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item>
                <Accordion.Trigger>Variable values for test</Accordion.Trigger>
                <Accordion.Panel>
                  <TableList<VariableForTest>
                    initialItems={options?.variablesForTest}
                    onItemsChange={updateVariablesForTest}
                    addLabel="Add an entry"
                  >
                    {(props) => <VariableForTestInputs {...props} />}
                  </TableList>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      {httpRequest?.url && (
        <Button onClick={executeTestRequest} disabled={isTestResponseLoading}>
          Test the request
        </Button>
      )}
      {testResponse && (
        <CodeEditor isReadOnly lang="json" value={testResponse} />
      )}
      {(testResponse ||
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
    </>
  );
};
