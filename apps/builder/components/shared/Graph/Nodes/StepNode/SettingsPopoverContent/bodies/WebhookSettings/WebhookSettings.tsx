import React, { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Spinner,
  Stack,
  useToast,
  Text,
} from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { useTypebot } from 'contexts/TypebotContext'
import {
  HttpMethod,
  KeyValue,
  WebhookOptions,
  VariableForTest,
  ResponseVariableMapping,
  WebhookStep,
  defaultWebhookAttributes,
  Webhook,
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
import { byId } from 'utils'
import { deepEqual } from 'fast-equals'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'

type Props = {
  step: WebhookStep
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({
  step: { options, blockId, id: stepId, webhookId },
  onOptionsChange,
}: Props) => {
  const { typebot, save, webhooks, updateWebhook } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const [localWebhook, setLocalWebhook] = useState(
    webhooks.find(byId(webhookId))
  )

  useEffect(() => {
    const incomingWebhook = webhooks.find(byId(webhookId))
    if (deepEqual(incomingWebhook, localWebhook)) return
    setLocalWebhook(incomingWebhook)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhooks])

  useEffect(() => {
    if (!typebot) return
    if (!localWebhook) {
      const newWebhook = {
        id: webhookId,
        ...defaultWebhookAttributes,
        typebotId: typebot.id,
      } as Webhook
      updateWebhook(webhookId, newWebhook)
    }

    return () => {
      setLocalWebhook((localWebhook) => {
        if (!localWebhook) return
        updateWebhook(webhookId, localWebhook).then()
        return localWebhook
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUrlChange = (url?: string) =>
    localWebhook && setLocalWebhook({ ...localWebhook, url: url ?? null })

  const handleMethodChange = (method: HttpMethod) =>
    localWebhook && setLocalWebhook({ ...localWebhook, method })

  const handleQueryParamsChange = (queryParams: KeyValue[]) =>
    localWebhook && setLocalWebhook({ ...localWebhook, queryParams })

  const handleHeadersChange = (headers: KeyValue[]) =>
    localWebhook && setLocalWebhook({ ...localWebhook, headers })

  const handleBodyChange = (body: string) =>
    localWebhook && setLocalWebhook({ ...localWebhook, body })

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
    if (!typebot || !localWebhook) return
    setIsTestResponseLoading(true)
    await Promise.all([updateWebhook(localWebhook.id, localWebhook), save()])
    const { data, error } = await executeWebhook(
      typebot.id,
      convertVariableForTestToVariables(
        options.variablesForTest,
        typebot.variables
      ),
      { blockId, stepId }
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

  if (!localWebhook) return <Spinner />
  return (
    <Stack spacing={4}>
      <Input
        placeholder="Your Webhook URL..."
        defaultValue={localWebhook.url ?? ''}
        onChange={handleUrlChange}
      />
      <SwitchWithLabel
        id={'easy-config'}
        label="Advanced configuration"
        initialValue={options.isAdvancedConfig ?? true}
        onCheckChange={handleAdvancedConfigChange}
      />
      {(options.isAdvancedConfig ?? true) && (
        <Stack>
          <HStack justify="space-between">
            <Text>Method:</Text>
            <DropdownList<HttpMethod>
              currentItem={localWebhook.method as HttpMethod}
              onItemSelect={handleMethodChange}
              items={Object.values(HttpMethod)}
            />
          </HStack>
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Query params
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<KeyValue>
                  initialItems={localWebhook.queryParams}
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
                  initialItems={localWebhook.headers}
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
                <SwitchWithLabel
                  id={'custom-body'}
                  label="Custom body"
                  initialValue={options.isCustomBody ?? true}
                  onCheckChange={handleBodyFormStateChange}
                />
                {(options.isCustomBody ?? true) && (
                  <CodeEditor
                    value={localWebhook.body ?? ''}
                    lang="json"
                    onChange={handleBodyChange}
                  />
                )}
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
        </Stack>
      )}
      <Stack>
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
    </Stack>
  )
}
