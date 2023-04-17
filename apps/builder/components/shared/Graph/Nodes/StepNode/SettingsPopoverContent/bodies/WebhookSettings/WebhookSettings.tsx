import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
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
  Link
} from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { useTypebot } from 'contexts/TypebotContext'
import {
  KeyValue,
  WebhookOptions,
  VariableForTest,
  ResponseVariableMapping,
  WebhookStep,
  defaultWebhookAttributes,
  Webhook,
  StepIndices,
  QueryParameters,
  Variable,
  Session,
  VariableLight
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
import { sendOctaRequest } from 'util/octaRequest'
import { debug } from 'console'
import { Textarea } from 'components/shared/Textbox'
// import { validateUrl } from 'utils'

enum HttpMethodsWebhook {
  POST = "POST",
  GET = "GET",
  PUT = "PUT"
}

type Props = {
  step: WebhookStep,
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({
  step,
  onOptionsChange
}: Props) => {
  const { typebot } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  if (step.options.path?.length)
  {
    step.options.url += step.options.path?.length ? step.options.path[0].value : ''
    step.options.path = []
  }

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleUrlChange = (url?: string) => {
    if (step.options.url != url) clearOptions()
    if (url && url.length > 5) {
      const newUrl = new URL(url.replace(/ /g, '').trim())
      url = newUrl.origin

      if (newUrl.search) handleParams(newUrl.search)

      //addParams('path', '', newUrl.pathname, newUrl.pathname)

      onOptionsChange({
        ...step.options,
        url: (url ? url : "") + newUrl.pathname
      })
    }
  }

  const clearOptions = () => {
    const options = step.options
    options.parameters = []
    options.path = []
    options.returnMap = ""
    options.responseVariableMapping = []
    options.variablesForTest = []
    options.headers = []
  }

  const handleParams = (url: string) => {
    const params = url.substring(1).split('&')
    params.forEach(p => {
      const keyValue = p.split('=')
      if (keyValue.length === 2) {
        addParams('query', keyValue[0], keyValue[1], keyValue[1])
      }
    })
  }

  const addParams = (type: string, key: string, value: string, displayValue: string, properties?: Variable | undefined) => {
    step.options.path.push({
      key: key || '',
      value: value || '',
      displayValue: displayValue || '',
      type,
      isNew: true,
      properties: properties
    })
  }

  const handleMethodChange = (method: HttpMethodsWebhook) => {
    onOptionsChange({
      ...step.options,
      method: method
    })
  }



  const handleQueryParamsChange = (parameters: QueryParameters[]) => {
    onOptionsChange({
      ...step.options,
      parameters
    })
  }

  const handleHeadersChange = (headers: QueryParameters[]) => {
    onOptionsChange({
      ...step.options,
      headers
    })
  }

  const handleBodyChange = (body: string) => {
    onOptionsChange({
      ...step.options,
      body: body
    })
  }

  const handleVariablesChange = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...step.options, variablesForTest })

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => {
    onOptionsChange({ ...step.options, responseVariableMapping })
  }

  const handleAdvancedConfigChange = (isAdvancedConfig: boolean) =>
    onOptionsChange({ ...step.options, isAdvancedConfig })

  const handleBodyFormStateChange = (isCustomBody: boolean) =>
    onOptionsChange({ ...step.options, isCustomBody })

  const resolveSession = (variablesForTest: VariableForTest[], variables: Variable[]) => {
    if (!variablesForTest?.length || !variables?.length) return {}

    let session: Session = {
      propertySpecs: [],
      properties: {}
    }

    variablesForTest.forEach(testVariable => {
      const variable = variables.find(v => v.id === testVariable.variableId)
      if (!variable) return

      const light: VariableLight = {
        domain: variable.domain,
        name: variable.name,
        token: variable.token,
        type: variable.type
      }

      session.propertySpecs.push(light)
      if (!session.properties[light.domain])
        session.properties[light.domain] = {}

      session.properties[light.domain][light.name] = { spec: light, value: testVariable.value }
    })

    return session
  }

  const handleTestRequestClick = async () => {
    if (!typebot || !step.options) return
    setIsTestResponseLoading(true)

    const options = step.options as WebhookOptions
    const parameters = options.parameters.concat(options.path, options.headers)

    const localWebhook = {
      method: options.method,
      body: options.body,
      parameters: parameters,
      url: options.url
    }

    const session = resolveSession(options.variablesForTest, typebot.variables)

    const { data } = await sendOctaRequest({
      url: `validate/webhook`,
      method: 'POST',
      body: {
        session,
        webhook: localWebhook
      }
    })

    const { response, success } = data

    setIsTestResponseLoading(false)

    if (!success) return toast({ title: 'Error', description: `Não foi possivel realizar a sua integração 😢` })

    if (typeof response === 'object') {
      setTestResponse(JSON.stringify(response, undefined, 2))
      setResponseKeys(getDeepKeys(response))
    } else {
      setTestResponse(response)
    }
  }

  const ResponseMappingInputs = useMemo(
    () => (props: TableListItemProps<ResponseVariableMapping>) =>
      <DataVariableInputs {...props} dataItems={responseKeys} />,
    [responseKeys]
  )

  const handlerDefault = (e: any) => {
  }

  return (
    <Stack spacing={4}>
      (
        <Stack>
          <HStack justify="space-between">
            <Text>O que você quer fazer</Text>
            <DropdownList<HttpMethodsWebhook>
              currentItem={step.options.method}
              onItemSelect={handleMethodChange}
              items={Object.values(HttpMethodsWebhook)}
            />
          </HStack>
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                URL com path
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <Text color="gray.500" fontSize="sm">
                  Edite os parâmetros da sua URL inserindo campos
                  na sua composição (ex.: https://apiurl.com/<strong>#valor</strong>/valid)
                </Text>
                <Textarea
                  placeholder="Digite o endereço da API ou do sistema"
                  defaultValue={step.options.url}
                  onChange={handleUrlChange}
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
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
                <TableList<QueryParameters>
                  initialItems={step.options.parameters}
                  onItemsChange={handleQueryParamsChange}
                  Item={QueryParamsInputs}
                  addLabel="Adicionar parâmetro"
                  type="query"
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
                <TableList<QueryParameters>
                  initialItems={step.options.headers}
                  onItemsChange={handleHeadersChange}
                  Item={QueryParamsInputs}
                  addLabel="Adicionar parâmetro"
                  type="query"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
            {(step.options?.method === 'POST') && (
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Body
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} as={Stack} spacing="6">
                  <SwitchWithLabel
                    id={'custom-body'}
                    label="Customizar body"
                    initialValue={step.options.isCustomBody ?? true}
                    onCheckChange={handleBodyFormStateChange}
                  />
                  {(step.options.isCustomBody ?? true) && (
                    <CodeEditor
                      value={step.options.body ?? ''}
                      lang="json"
                      onChange={handleBodyChange}
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
            )}
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Valores variáveis para teste
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<VariableForTest>
                  initialItems={
                    step.options?.variablesForTest ?? { byId: {}, allIds: [] }
                  }
                  onItemsChange={handleVariablesChange}
                  Item={VariableForTestInputs}
                  addLabel="Adicionar variável"
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Stack>
      )
      <Stack>
        {step.options.url && (
          <Button
            onClick={handleTestRequestClick}
            colorScheme="blue"
            isLoading={isTestResponseLoading}
          >
            Testar request
          </Button>
        )}
        {testResponse && (
          <CodeEditor isReadOnly lang="json" value={testResponse} />
        )}
        {(testResponse || step.options?.responseVariableMapping.length > 0) && (
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Salvar variavéis
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<ResponseVariableMapping>
                  initialItems={step.options.responseVariableMapping}
                  onItemsChange={handleResponseMappingChange}
                  Item={ResponseMappingInputs}
                  addLabel="Adicionar variável"
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
