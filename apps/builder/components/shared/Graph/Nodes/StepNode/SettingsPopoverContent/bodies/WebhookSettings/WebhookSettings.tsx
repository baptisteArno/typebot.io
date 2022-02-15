import React, { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { InputWithVariableButton } from 'components/shared/TextboxWithVariableButton/InputWithVariableButton'
import { useTypebot } from 'contexts/TypebotContext'
import {
  HttpMethod,
  KeyValue,
  WebhookOptions,
  VariableForTest,
  Webhook,
  ResponseVariableMapping,
  WebhookStep,
  StepIndices,
} from 'models'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList, TableListItemProps } from 'components/shared/TableList'
import { CodeEditor } from 'components/shared/CodeEditor'
import {
  convertVariableForTestToVariables,
  executeWebhook,
  getDeepKeys,
} from 'services/integrations'
import { HeadersInputs, QueryParamsInputs } from './KeyValueInputs'
import { VariableForTestInputs } from './VariableForTestInputs'
import { DataVariableInputs } from './ResponseMappingInputs'

type Props = {
  step: WebhookStep
  onOptionsChange: (options: WebhookOptions) => void
  onWebhookChange: (updates: Partial<Webhook>) => void
  onTestRequestClick: () => void
  indices: StepIndices
}

export const WebhookSettings = ({
  step: { webhook, options },
  onOptionsChange,
  onWebhookChange,
  onTestRequestClick,
  indices,
}: Props) => {
  const { typebot, save } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleUrlChange = (url?: string) => onWebhookChange({ url })

  const handleMethodChange = (method: HttpMethod) => onWebhookChange({ method })

  const handleQueryParamsChange = (queryParams: KeyValue[]) =>
    onWebhookChange({ queryParams })

  const handleHeadersChange = (headers: KeyValue[]) =>
    onWebhookChange({ headers })

  const handleBodyChange = (body: string) => onWebhookChange({ body })

  const handleVariablesChange = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...options, variablesForTest })

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => onOptionsChange({ ...options, responseVariableMapping })

  const handleTestRequestClick = async () => {
    if (!typebot) return
    setIsTestResponseLoading(true)
    onTestRequestClick()
    await save()
    const { data, error } = await executeWebhook(
      typebot.id,
      webhook.id,
      convertVariableForTestToVariables(
        options.variablesForTest,
        typebot.variables
      ),
      indices
    )
    if (error) return toast({ title: error.name, description: error.message })
    setTestResponse(JSON.stringify(data, undefined, 2))
    setResponseKeys(getDeepKeys(data))
    setIsTestResponseLoading(false)
  }

  const ResponseMappingInputs = useMemo(
    () => (props: TableListItemProps<ResponseVariableMapping>) =>
      <DataVariableInputs {...props} dataItems={responseKeys} />,
    [responseKeys]
  )

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <DropdownList<HttpMethod>
            currentItem={webhook.method}
            onItemSelect={handleMethodChange}
            items={Object.values(HttpMethod)}
          />
        </Flex>
        <InputWithVariableButton
          placeholder="Your Webhook URL..."
          initialValue={webhook.url ?? ''}
          onChange={handleUrlChange}
        />
      </Stack>
      <Accordion allowToggle allowMultiple>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Query params
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} as={Stack} spacing="6">
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
          <AccordionPanel pb={4} as={Stack} spacing="6">
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
          <AccordionPanel pb={4} as={Stack} spacing="6">
            <CodeEditor
              value={webhook.body ?? ''}
              lang="json"
              onChange={handleBodyChange}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Variable values for test
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} as={Stack} spacing="6">
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
      <Button
        onClick={handleTestRequestClick}
        colorScheme="blue"
        isLoading={isTestResponseLoading}
      >
        Test the request
      </Button>
      {testResponse && (
        <CodeEditor isReadOnly lang="json" value={testResponse} />
      )}
      {(testResponse || options?.responseVariableMapping) && (
        <Accordion allowToggle allowMultiple>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Save in variables
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} as={Stack} spacing="6">
              <TableList<ResponseVariableMapping>
                initialItems={options.responseVariableMapping}
                onItemsChange={handleResponseMappingChange}
                Item={ResponseMappingInputs}
                addLabel="Add an entry"
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </Stack>
  )
}
