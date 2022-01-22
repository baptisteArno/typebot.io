import React, { useEffect, useMemo, useState } from 'react'
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
import { InputWithVariableButton } from 'components/shared/InputWithVariableButton'
import { useTypebot } from 'contexts/TypebotContext'
import {
  HttpMethod,
  KeyValue,
  Table,
  WebhookOptions,
  VariableForTest,
  Webhook,
  ResponseVariableMapping,
} from 'models'
import { DropdownList } from 'components/shared/DropdownList'
import { generate } from 'short-uuid'
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
  options?: WebhookOptions
  webhook?: Webhook
  onOptionsChange: (options: WebhookOptions) => void
  onWebhookChange: (webhook: Partial<Webhook>) => void
}

export const WebhookSettings = ({
  options,
  webhook,
  onOptionsChange,
  onWebhookChange,
}: Props) => {
  const { createWebhook, typebot, save } = useTypebot()
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    if (options?.webhookId) return
    const webhookId = generate()
    createWebhook({ id: webhookId })
    onOptionsChange({ ...options, webhookId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUrlChange = (url?: string) => onWebhookChange({ url })

  const handleMethodChange = (method?: HttpMethod) =>
    onWebhookChange({ method })

  const handleQueryParamsChange = (queryParams: Table<KeyValue>) =>
    onWebhookChange({ queryParams })

  const handleHeadersChange = (headers: Table<KeyValue>) =>
    onWebhookChange({ headers })

  const handleBodyChange = (body: string) => onWebhookChange({ body })

  const handleVariablesChange = (variablesForTest: Table<VariableForTest>) =>
    onOptionsChange({ ...options, variablesForTest })

  const handleResponseMappingChange = (
    responseVariableMapping: Table<ResponseVariableMapping>
  ) => onOptionsChange({ ...options, responseVariableMapping })

  const handleTestRequestClick = async () => {
    if (!typebot || !webhook) return
    await save()
    const { data, error } = await executeWebhook(
      typebot.id,
      webhook.id,
      convertVariableForTestToVariables(
        options?.variablesForTest,
        typebot.variables
      )
    )
    if (error) return toast({ title: error.name, description: error.message })
    setTestResponse(JSON.stringify(data, undefined, 2))
    setResponseKeys(getDeepKeys(data))
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
            currentItem={webhook?.method ?? HttpMethod.GET}
            onItemSelect={handleMethodChange}
            items={Object.values(HttpMethod)}
          />
        </Flex>
        <InputWithVariableButton
          placeholder="Your Webhook URL..."
          initialValue={webhook?.url ?? ''}
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
              initialItems={webhook?.queryParams}
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
              initialItems={webhook?.headers}
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
              value={webhook?.body ?? ''}
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
              initialItems={options?.variablesForTest}
              onItemsChange={handleVariablesChange}
              Item={VariableForTestInputs}
              addLabel="Add an entry"
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Button onClick={handleTestRequestClick} colorScheme="blue">
        Test the request
      </Button>
      {testResponse && <CodeEditor isReadOnly value={testResponse} />}
      {(testResponse || options?.responseVariableMapping) && (
        <Accordion allowToggle allowMultiple>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Save in variables
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} as={Stack} spacing="6">
              <TableList<ResponseVariableMapping>
                initialItems={options?.responseVariableMapping}
                onItemsChange={handleResponseMappingChange}
                Item={ResponseMappingInputs}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </Stack>
  )
}
