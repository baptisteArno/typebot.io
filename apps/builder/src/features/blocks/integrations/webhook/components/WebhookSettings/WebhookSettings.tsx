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
  Text,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import {
  HttpMethod,
  KeyValue,
  WebhookOptions,
  VariableForTest,
  ResponseVariableMapping,
  WebhookBlock,
  MakeComBlock,
  PabblyConnectBlock,
  Webhook,
} from 'models'
import { DropdownList } from '@/components/DropdownList'
import { CodeEditor } from '@/components/CodeEditor'
import { HeadersInputs, QueryParamsInputs } from './KeyValueInputs'
import { VariableForTestInputs } from './VariableForTestInputs'
import { DataVariableInputs } from './ResponseMappingInputs'
import { byId, env } from 'utils'
import { ExternalLinkIcon } from '@/components/icons'
import { useToast } from '@/hooks/useToast'
import { SwitchWithLabel } from '@/components/SwitchWithLabel'
import { TableListItemProps, TableList } from '@/components/TableList'
import { executeWebhook } from '../../queries/executeWebhookQuery'
import { getDeepKeys } from '../../utils/getDeepKeys'
import { Input } from '@/components/inputs'
import { convertVariablesForTestToVariables } from '../../utils/convertVariablesForTestToVariables'
import { useDebouncedCallback } from 'use-debounce'

const debounceWebhookTimeout = 2000

type Provider = {
  name: 'Pabbly Connect'
  url: string
}

type Props = {
  block: WebhookBlock | MakeComBlock | PabblyConnectBlock
  onOptionsChange: (options: WebhookOptions) => void
  provider?: Provider
}

export const WebhookSettings = ({
  block: { options, id: blockId, webhookId },
  onOptionsChange,
  provider,
}: Props) => {
  const { typebot, save, webhooks, updateWebhook } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])
  const { showToast } = useToast()
  const [localWebhook, _setLocalWebhook] = useState(
    webhooks.find(byId(webhookId))
  )
  const updateWebhookDebounced = useDebouncedCallback(
    async (newLocalWebhook) => {
      await updateWebhook(newLocalWebhook.id, newLocalWebhook)
    },
    env('E2E_TEST') === 'true' ? 0 : debounceWebhookTimeout
  )

  const setLocalWebhook = (newLocalWebhook: Webhook) => {
    _setLocalWebhook(newLocalWebhook)
    updateWebhookDebounced(newLocalWebhook)
  }

  useEffect(
    () => () => {
      updateWebhookDebounced.flush()
    },
    [updateWebhookDebounced]
  )

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

  if (!localWebhook) return <Spinner />

  return (
    <Stack spacing={4}>
      {provider && (
        <Alert status={'info'} rounded="md">
          <AlertIcon />
          <Stack>
            <Text>Head up to {provider.name} to configure this block:</Text>
            <Button as={Link} href={provider.url} isExternal colorScheme="blue">
              <Text mr="2">{provider.name}</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        </Alert>
      )}
      <Input
        placeholder="Paste webhook URL..."
        defaultValue={localWebhook.url ?? ''}
        onChange={handleUrlChange}
        debounceTimeout={0}
        withVariableButton={!provider}
      />
      <SwitchWithLabel
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
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Query params
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={4} as={Stack} spacing="6">
                <TableList<KeyValue>
                  initialItems={localWebhook.queryParams}
                  onItemsChange={handleQueryParamsChange}
                  Item={QueryParamsInputs}
                  addLabel="Add a param"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Headers
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={4} as={Stack} spacing="6">
                <TableList<KeyValue>
                  initialItems={localWebhook.headers}
                  onItemsChange={handleHeadersChange}
                  Item={HeadersInputs}
                  addLabel="Add a value"
                  debounceTimeout={0}
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
                    value={localWebhook.body ?? ''}
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
              <AccordionPanel py={4} as={Stack} spacing="6">
                <TableList<VariableForTest>
                  initialItems={
                    options?.variablesForTest ?? { byId: {}, allIds: [] }
                  }
                  onItemsChange={handleVariablesChange}
                  Item={VariableForTestInputs}
                  addLabel="Add an entry"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Stack>
      )}
      <Stack>
        {localWebhook.url && (
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
        {(testResponse || options?.responseVariableMapping.length > 0) && (
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Save in variables
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel py={4} as={Stack} spacing="6">
                <TableList<ResponseVariableMapping>
                  initialItems={options.responseVariableMapping}
                  onItemsChange={handleResponseMappingChange}
                  Item={ResponseMappingInputs}
                  addLabel="Add an entry"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </Stack>
    </Stack>
  )
}
