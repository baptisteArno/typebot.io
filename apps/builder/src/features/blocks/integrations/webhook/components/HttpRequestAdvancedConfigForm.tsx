import { DropdownList } from "@/components/DropdownList";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TableList, type TableListItemProps } from "@/components/TableList";
import { NumberInput } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useToast } from "@/hooks/useToast";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  HttpMethod,
  defaultTimeout,
  defaultWebhookAttributes,
  defaultWebhookBlockOptions,
  maxTimeout,
} from "@typebot.io/blocks-integrations/webhook/constants";
import type {
  HttpRequest,
  HttpRequestBlock,
  KeyValue,
  ResponseVariableMapping,
  VariableForTest,
} from "@typebot.io/blocks-integrations/webhook/schema";
import { useMemo, useState } from "react";
import { convertVariablesForTestToVariables } from "../helpers/convertVariablesForTestToVariables";
import { getDeepKeys } from "../helpers/getDeepKeys";
import { executeWebhook } from "../queries/executeWebhookQuery";
import { HeadersInputs, QueryParamsInputs } from "./KeyValueInputs";
import { DataVariableInputs } from "./ResponseMappingInputs";
import { VariableForTestInputs } from "./VariableForTestInputs";

type Props = {
  blockId: string;
  webhook: HttpRequest | undefined;
  options: HttpRequestBlock["options"];
  onWebhookChange: (webhook: HttpRequest) => void;
  onOptionsChange: (options: HttpRequestBlock["options"]) => void;
};

export const HttpRequestAdvancedConfigForm = ({
  blockId,
  webhook,
  options,
  onWebhookChange,
  onOptionsChange,
}: Props) => {
  const { typebot, save } = useTypebot();
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string>();
  const [responseKeys, setResponseKeys] = useState<string[]>([]);
  const { showToast } = useToast();

  const updateMethod = (method: HttpMethod) =>
    onWebhookChange({ ...webhook, method });

  const updateQueryParams = (queryParams: KeyValue[]) =>
    onWebhookChange({ ...webhook, queryParams });

  const updateHeaders = (headers: KeyValue[]) =>
    onWebhookChange({ ...webhook, headers });

  const updateBody = (body: string) => onWebhookChange({ ...webhook, body });

  const updateVariablesForTest = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...options, variablesForTest });

  const updateResponseVariableMapping = (
    responseVariableMapping: ResponseVariableMapping[],
  ) => onOptionsChange({ ...options, responseVariableMapping });

  const updateAdvancedConfig = (isAdvancedConfig: boolean) =>
    onOptionsChange({ ...options, isAdvancedConfig });

  const updateIsCustomBody = (isCustomBody: boolean) =>
    onOptionsChange({ ...options, isCustomBody });

  const updateTimeout = (timeout: number | undefined) =>
    onOptionsChange({ ...options, timeout });

  const executeTestRequest = async () => {
    if (!typebot) return;
    setIsTestResponseLoading(true);
    if (!options?.webhook) await save();
    else await save();
    const { data, error } = await executeWebhook(
      typebot.id,
      convertVariablesForTestToVariables(
        options?.variablesForTest ?? [],
        typebot.variables,
      ),
      { blockId },
    );
    if (error)
      return showToast({ title: error.name, description: error.message });
    setTestResponse(JSON.stringify(data, undefined, 2));
    setResponseKeys(getDeepKeys(data));
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

  const isCustomBody =
    options?.isCustomBody ?? defaultWebhookBlockOptions.isCustomBody;

  return (
    <>
      <SwitchWithRelatedSettings
        label="Advanced configuration"
        initialValue={
          options?.isAdvancedConfig ??
          defaultWebhookBlockOptions.isAdvancedConfig
        }
        onCheckChange={updateAdvancedConfig}
      >
        <SwitchWithLabel
          label="Execute on client"
          moreInfoContent="If enabled, the webhook will be executed on the client. It means it will be executed in the browser of your visitor. Make sure to enable CORS and do not expose sensitive data."
          initialValue={
            options?.isExecutedOnClient ??
            defaultWebhookBlockOptions.isExecutedOnClient
          }
          onCheckChange={updateIsExecutedOnClient}
        />
        <HStack justify="space-between">
          <Text>Method:</Text>
          <DropdownList
            currentItem={
              (webhook?.method ?? defaultWebhookAttributes.method) as HttpMethod
            }
            onItemSelect={updateMethod}
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
                initialItems={webhook?.queryParams}
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
                initialItems={webhook?.headers}
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
                  defaultValue={webhook?.body}
                  lang="json"
                  onChange={updateBody}
                  debounceTimeout={0}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Advanced parameters
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pt="4">
              <NumberInput
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
      </SwitchWithRelatedSettings>
      {webhook?.url && (
        <Button
          onClick={executeTestRequest}
          colorScheme="blue"
          isLoading={isTestResponseLoading}
        >
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
