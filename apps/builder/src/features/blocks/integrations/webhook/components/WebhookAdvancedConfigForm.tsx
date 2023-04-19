import { DropdownList } from '@/components/DropdownList'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { TableList, TableListItemProps } from '@/components/TableList'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useToast } from '@/hooks/useToast'
import {
  Stack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Button,
  Text,
} from '@chakra-ui/react'
import {
  HttpMethod,
  KeyValue,
  VariableForTest,
  ResponseVariableMapping,
  WebhookOptions,
  Webhook,
} from '@typebot.io/schemas'
import { useState, useMemo } from 'react'
import { executeWebhook } from '../queries/executeWebhookQuery'
import { convertVariablesForTestToVariables } from '../helpers/convertVariablesForTestToVariables'
import { getDeepKeys } from '../helpers/getDeepKeys'
import { QueryParamsInputs, HeadersInputs } from './KeyValueInputs'
import { DataVariableInputs } from './ResponseMappingInputs'
import { VariableForTestInputs } from './VariableForTestInputs'

type Props = {
  blockId: string
  webhook: Webhook
  options: WebhookOptions
  onWebhookChange: (webhook: Webhook) => void
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookAdvancedConfigForm = ({
  blockId,
  webhook,
  options,
  onWebhookChange,
  onOptionsChange,
}: Props) => {
  const { typebot, save, updateWebhook } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])
  const { showToast } = useToast()

  const handleMethodChange = (method: HttpMethod) =>
    onWebhookChange({ ...webhook, method })

  const handleQueryParamsChange = (queryParams: KeyValue[]) =>
    onWebhookChange({ ...webhook, queryParams })

  const handleHeadersChange = (headers: KeyValue[]) =>
    onWebhookChange({ ...webhook, headers })

  const handleBodyChange = (body: string) =>
    onWebhookChange({ ...webhook, body })

  const handleVariablesChange = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...options, variablesForTest })

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => onOptionsChange({ ...options, responseVariableMapping })

  const handleAdvancedConfigChange = (isAdvancedConfig: boolean) =>
    onOptionsChange({ ...options, isAdvancedConfig })

  const handleBodyFormStateChange = (isCustomBody: boolean) =>
    onOptionsChange({ ...options, isCustomBody })

  const handleTestRequestClick = async () => {
    if (!typebot || !webhook) return
    setIsTestResponseLoading(true)
    await Promise.all([updateWebhook(webhook.id, webhook), save()])
    const { data, error } = await executeWebhook(
      typebot.id,
      convertVariablesForTestToVariables(
        options.variablesForTest,
        typebot.variables
      ),
      { blockId }
    )
    if (error)
      return showToast({ title: error.name, description: error.message })
    setTestResponse(JSON.stringify(data, undefined, 2))
    setResponseKeys(getDeepKeys(data))
    setIsTestResponseLoading(false)
  }

  const ResponseMappingInputs = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <DataVariableInputs {...props} dataItems={responseKeys} />
      },
    [responseKeys]
  )

  return (
    <>
      <SwitchWithLabel
        label="Advanced configuration"
        initialValue={options.isAdvancedConfig ?? true}
        onCheckChange={handleAdvancedConfigChange}
      />
      {(options.isAdvancedConfig ?? true) && (
        <>
          <HStack justify="space-between">
            <Text>Method:</Text>
            <DropdownList
              currentItem={webhook.method as HttpMethod}
              onItemSelect={handleMethodChange}
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
                  initialItems={webhook.queryParams}
                  onItemsChange={handleQueryParamsChange}
                  Item={QueryParamsInputs}
                  addLabel="Add a param"
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Headers
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pt="4">
                <TableList<KeyValue>
                  initialItems={webhook.headers}
                  onItemsChange={handleHeadersChange}
                  Item={HeadersInputs}
                  addLabel="Add a value"
                />
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
                  initialValue={options.isCustomBody ?? true}
                  onCheckChange={handleBodyFormStateChange}
                />
                {(options.isCustomBody ?? true) && (
                  <CodeEditor
                    defaultValue={webhook.body ?? ''}
                    lang="json"
                    onChange={handleBodyChange}
                    debounceTimeout={0}
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Variable values for test
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pt="4">
                <TableList<VariableForTest>
                  initialItems={
                    options?.variablesForTest ?? { byId: {}, allIds: [] }
                  }
                  onItemsChange={handleVariablesChange}
                  Item={VariableForTestInputs}
                  addLabel="Add an entry"
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      )}
      {webhook.url && (
        <Button
          onClick={handleTestRequestClick}
          colorScheme="blue"
          isLoading={isTestResponseLoading}
        >
          Test the request
        </Button>
      )}
      {testResponse && (
        <CodeEditor isReadOnly lang="json" value={testResponse} />
      )}
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Save in variables
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pt="4">
            <TableList<ResponseVariableMapping>
              initialItems={options.responseVariableMapping}
              onItemsChange={handleResponseMappingChange}
              Item={ResponseMappingInputs}
              addLabel="Add an entry"
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
