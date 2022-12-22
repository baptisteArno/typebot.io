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
  Alert,
  AlertIcon,
  Link,
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
import { byId } from 'utils'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { ExternalLinkIcon } from 'assets/icons'

type Props = {
  step: WebhookStep,
  onOptionsChange: (options: WebhookOptions) => void
}

const localWebhook  = {
  url: "",
  method:"",
  queryParams: "",
  headers: [],
  body: ""
};

export const WebhookSettings = ({
  step: { options, blockId, id: stepId, webhookId },
  onOptionsChange
}: Props) => {
  const { typebot } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  // const handleUrlChange = (url?: string) =>{
  //   localWebhook && setLocalWebhook({ ...localWebhook, url: url ?? null})
  // }

  // const handleMethodChange = (method: HttpMethod) =>
  //   localWebhook && setLocalWebhook({ ...localWebhook, method: method ?? 'PUT'})

  // const handleQueryParamsChange = (queryParams: KeyValue[]) =>
  //   localWebhook && setLocalWebhook({ ...localWebhook, queryParams })

  // const handleHeadersChange = (headers: KeyValue[]) =>
  //   localWebhook && setLocalWebhook({ ...localWebhook, headers })

  // const handleBodyChange = (body: string) =>
  //   localWebhook && setLocalWebhook({ ...localWebhook, body })

  // const handleVariablesChange = (variablesForTest: VariableForTest[]) =>
  //   onOptionsChange({ ...options, variablesForTest })

  // const handleResponseMappingChange = (
  //   responseVariableMapping: ResponseVariableMapping[]
  // ) => onOptionsChange({ ...options, responseVariableMapping })

  // const handleAdvancedConfigChange = (isAdvancedConfig: boolean) =>
  //   onOptionsChange({ ...options, isAdvancedConfig })

  // const handleBodyFormStateChange = (isCustomBody: boolean) =>
  //   onOptionsChange({ ...options, isCustomBody })

  // const handleTestRequestClick = async () => {
  //   if (!typebot || !localWebhook) return
  //   setIsTestResponseLoading(true)
  //   await Promise.all([updateWebhook(localWebhook.id, localWebhook), save()])
  //   const { data, error } = await executeWebhook(
  //     typebot.id,
  //     convertVariableForTestToVariables(
  //       options.variablesForTest,
  //       typebot.variables
  //     ),
  //     { blockId, stepId }
  //   )
  //   if (error) return toast({ title: error.name, description: error.message })
  //   setTestResponse(JSON.stringify(data, undefined, 2))
  //   setResponseKeys(getDeepKeys(data))
  //   setIsTestResponseLoading(false)
  // }

  // const ResponseMappingInputs = useMemo(
  //   () => (props: TableListItemProps<ResponseVariableMapping>) =>
  //     <DataVariableInputs {...props} dataItems={responseKeys} />,
  //   [responseKeys]
  // )

  // if (!localWebhook) return <Spinner />

  const handlerDefault = (e: any) => {
    console.log("teste");
  }

  return (
    <Stack spacing={4}>
      <Input
        placeholder="Digite o endereço da API ou do sistema"
        defaultValue={localWebhook?.url ?? ''}
        onChange={handlerDefault}
        debounceTimeout={0}
      />
      <SwitchWithLabel
        id={'easy-config'}
        label="Selecionar o método da integração"
        initialValue={options.isAdvancedConfig ?? true}
        onCheckChange={handlerDefault}
      />
      {(options.isAdvancedConfig ?? true) && (
        <Stack>
          <HStack justify="space-between">
            <Text>O que você quer fazer</Text>
            <DropdownList<HttpMethod>
              currentItem={localWebhook?.method as HttpMethod}
              onItemSelect={handlerDefault}
              items={Object.values(HttpMethod)}
            />
          </HStack>
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Params
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <Text color="gray.500" fontSize="sm">
                  Adicione sua informações ao final da URL da integração
                  (ex.:https://apiurl.com/<strong>?cep=#cep</strong>)
                </Text>
                <TableList<KeyValue>
                  initialItems={[]}
                  onItemsChange={handlerDefault}
                  Item={QueryParamsInputs}
                  addLabel="Adicionar parâmetro"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Headers
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <Text color="gray.500" fontSize="sm">
                  Sua informação no cabeçalho da integração 
                  <strong> (ex.: Authorization: Basic 1234)</strong>
                </Text> 
                <TableList<KeyValue>
                  initialItems={localWebhook?.headers ?? []}
                  onItemsChange={handlerDefault}
                  Item={HeadersInputs}
                  addLabel="Adicionar parâmetro"
                  debounceTimeout={0}
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
                  label="Customizar body"
                  initialValue={options.isCustomBody ?? true}
                  onCheckChange={handlerDefault}
                />
                {(options.isCustomBody ?? true) && (
                  <CodeEditor
                    value={localWebhook?.body ?? ''}
                    lang="json"
                    onChange={handlerDefault}
                    debounceTimeout={0}
                  >
                    <text color="gray.500" fontSize="sm">
                      Envie sua informação na corpo da integração  Request Body (apenas JSON)
                    <text>
                      Digite # para inserir campos personalizados
                    </text>
                    </text>
							      {/* "Request Body (apenas JSON)",
							      "Digite # para inserir campos personalizados" */}
                  </CodeEditor>
                )}
                
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Valores variáveis para teste
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<VariableForTest>
                  initialItems={
                    options?.variablesForTest ?? { byId: {}, allIds: [] }
                  }
                  onItemsChange={handlerDefault}
                  Item={VariableForTestInputs}
                  addLabel="Adicionar variável"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Stack>
      )}
      {/* <Stack>
        {localWebhook?.url && (
          <Button
            onClick={handlerDefault}
            colorScheme="blue"
            isLoading={isTestResponseLoading}
          >
            Testar request
          </Button>
        )}
        {testResponse && (
          <CodeEditor isReadOnly lang="json" value={testResponse} />
        )}
        {(testResponse || options?.responseVariableMapping.length > 0) && (
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Salvar variavéis
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<ResponseVariableMapping>
                  initialItems={options.responseVariableMapping}
                  onItemsChange={handlerDefault}
                  Item={}
                  addLabel="Adicionar variável"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </Stack> */}
    </Stack>
  )
}
