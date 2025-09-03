import { TableList, type TableListItemProps } from "@/components/TableList";
import { NumberInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { toast } from "@/lib/toast";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  HttpMethod,
  defaultHttpRequestAttributes,
  defaultHttpRequestBlockOptions,
  defaultTimeout,
  maxTimeout,
} from "@typebot.io/blocks-integrations/httpRequest/constants";
import type {
  HttpRequest,
  HttpRequestBlock,
  KeyValue,
  ResponseVariableMapping,
  VariableForTest,
} from "@typebot.io/blocks-integrations/httpRequest/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { useMemo, useState } from "react";
import { computeDeepKeysMappingSuggestionList } from "../helpers/computeDeepKeysMappingSuggestionList";
import { convertVariablesForTestToVariables } from "../helpers/convertVariablesForTestToVariables";
import { executeHttpRequest } from "../queries/executeHttpRequestQuery";
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
    if (!options?.webhook) await save();
    else await save();
    const { data, error } = await executeHttpRequest(
      typebot.id,
      convertVariablesForTestToVariables(
        options?.variablesForTest ?? [],
        typebot.variables,
      ),
      { blockId },
    );
    if (error) return toast({ description: error.message });
    setTestResponse(JSON.stringify(data, undefined, 2));
    setResponseKeys(computeDeepKeysMappingSuggestionList(data));
    setIsTestResponseLoading(false);
    onNewTestResponse?.();
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
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Advanced configuration
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pt="4" as={Stack} spacing="3">
            <SwitchWithLabel
              label="Execute on client"
              moreInfoContent="If enabled, the httpRequest will be executed on the client. It means it will be executed in the browser of your visitor. Make sure to enable CORS and do not expose sensitive data."
              initialValue={
                options?.isExecutedOnClient ??
                defaultHttpRequestBlockOptions.isExecutedOnClient
              }
              onCheckChange={updateIsExecutedOnClient}
            />
            <HStack justify="space-between">
              <Text>Method:</Text>
              <BasicSelect
                value={httpRequest?.method}
                defaultValue={defaultHttpRequestAttributes.method}
                onChange={updateMethod}
                items={Object.values(HttpMethod)}
              />
            </HStack>
            <Accordion allowMultiple>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Query params
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pt="4">
                  <TableList<KeyValue>
                    initialItems={httpRequest?.queryParams}
                    onItemsChange={updateQueryParams}
                    addLabel="Add a param"
                  >
                    {(props) => <QueryParamsInputs {...props} />}
                  </TableList>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Headers
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pt="4">
                  <TableList<KeyValue>
                    initialItems={httpRequest?.headers}
                    onItemsChange={updateHeaders}
                    addLabel="Add a value"
                  >
                    {(props) => <HeadersInputs {...props} />}
                  </TableList>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Body
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel py={4} as={Stack} spacing="6">
                  <SwitchWithLabel
                    label="Custom body"
                    initialValue={isCustomBody}
                    onCheckChange={updateIsCustomBody}
                  />
                  {isCustomBody && (
                    <CodeEditor
                      defaultValue={httpRequest?.body}
                      lang="json"
                      onChange={updateBody}
                      debounceTimeout={0}
                      withLineNumbers={true}
                    />
                  )}
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Advanced parameters
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pt="4" as={Stack}>
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
                  <NumberInput
                    direction="row"
                    label="Timeout (s)"
                    defaultValue={options?.timeout ?? defaultTimeout}
                    min={1}
                    max={maxTimeout}
                    onValueChange={updateTimeout}
                    withVariableButton={false}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Variable values for test
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pt="4">
                  <TableList<VariableForTest>
                    initialItems={options?.variablesForTest}
                    onItemsChange={updateVariablesForTest}
                    addLabel="Add an entry"
                  >
                    {(props) => <VariableForTestInputs {...props} />}
                  </TableList>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

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
        <Accordion allowMultiple>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Save in variables
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pt="4">
              <TableList<ResponseVariableMapping>
                initialItems={options?.responseVariableMapping}
                onItemsChange={updateResponseVariableMapping}
                addLabel="Add an entry"
              >
                {(props) => <ResponseMappingInputs {...props} />}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
