import React, { ChangeEvent, useEffect, useMemo, useState, useRef } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Stack,
  useToast,
  Text,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  WebhookOptions,
  VariableForTest,
  ResponseVariableMapping,
  WebhookStep,
  QueryParameters,
  Variable,
  Session,
  VariableLight
} from 'models'
import { DropdownList } from 'components/shared/DropdownList'
import { TableList, TableListItemProps } from 'components/shared/TableList'
import { CodeEditor } from 'components/shared/CodeEditor'
import { OpenEditorBody } from './OpenEditorBody'
import { getDeepKeys } from 'services/integrations'
import { VariableForTestInputs } from './VariableForTestInputs'
import { DataVariableInputs } from './ResponseMappingInputs'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { sendOctaRequest } from 'util/octaRequest'
import { HeadersInputs, QueryParamsInputs } from './KeyValueInputs'
import { Options } from 'use-debounce'
import { Input, Textarea } from 'components/shared/Textbox'
// import { validateUrl } from 'utils'

enum HttpMethodsWebhook {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS"
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
  const [successTest, setSuccessTest] = useState<string>()
  const [mountUrl, setMountUrl] = useState<string>()

  if (step.options.path?.length)
  {
    step.options.url += step.options.path?.length ? step.options.path[0].value : ''
    step.options.path = []
  }
  
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleUrlChange = (url: string) => {
    if (step.options.url != url) clearOptions()

    if (url && url.length > 5) {
      const newUrl = new URL(url.replace(/ /g, '').trim())
      url = newUrl.origin
      
      const hasPath = step.options.path.length

      if (newUrl.search) handleParams(newUrl.search)

      if(hasPath == 1) {
        step.options.path[hasPath].value = newUrl.pathname
        step.options.path[hasPath].displayValue = newUrl.pathname
        step.options.path[hasPath].properties = undefined
      } else {
        addParams('path', '', newUrl.pathname, newUrl.pathname)
      }

      onOptionsChange({
        ...step.options,
        url: (url ? url : "")
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

    setTestResponse(undefined)
    setSuccessTest("")
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
    const pathVariables = {
      key: key || '',
      value: value || '',
      displayValue: displayValue || '',
      type,
      isNew: true,
      properties: properties
    } as any

    if(type == 'path') {
      step.options.path = {...step.options.path , ...pathVariables}

      onOptionsChange({
        ...step.options,
        path: { ...step.options.path }
      })
    }
    else {
      step.options.parameters.push(pathVariables)
      
      onOptionsChange({
        ...step.options,
        parameters: { ...step.options.parameters }
      })
    }


    onOptionsChange({
      ...step.options,
      path: {...step.options.path}
    })
  }

  const handleMethodChange = (method: HttpMethodsWebhook) => {
    if (step.options.method != method) clearOptions()
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

  const [responseData, setResponseData] = useState({status: ''})

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

    const session: Session = {
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
    const parameters = step.options.parameters.concat(options.path, options.headers)

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
    setSuccessTest(success)

    console.log("RESPONSE", data)
    console.log("RESPONSE", data.status)

    setResponseData(data)
    if (!success) {
      toast({ title: 'Error ' + data.status, description: `Não foi possivel executar sua integração. 😢` })
    }

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
    console.log('e', e)
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
                  defaultValue={step.options.url ?? ''}
                  onChange={handleUrlChange}
                  debounceTimeout={0}
                />
              </AccordionPanel>
            </AccordionItem>
            {/* {hasPath && (
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Path
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} as={Stack} spacing="6">
                  <Text color="gray.500" fontSize="sm">
                    Adicione sua informações ao final da URL da integração
                    (ex.:https://apiurl.com/<strong>?cep=#cep</strong>)
                  </Text>
                  <TableList<QueryParameters>
                    initialItems={step.options.path}
                    onItemsChange={handlePath}
                    Item={QueryParamsInputs}
                    addLabel="Adicionar parâmetro"
                    type="query"
                    debounceTimeout={0}
                  />
                </AccordionPanel>
              </AccordionItem>
            )} */}
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
                    <Stack>
                      <text color="gray.500" fontSize="sm">
                        Envie sua informação na corpo da integração  Request Body (apenas JSON)
                      </text>
                      {/* Verificar se vamos deixar esse ativo */}
                      {/* <text>
                        Digite # para inserir campos personalizados
                      </text> */}
                      <OpenEditorBody
                        value={step.options.body ?? '{}'}
                        lang="json"
                        onChange={handleBodyChange}
                        debounceTimeout={0}
                      />
                      <CodeEditor
                        value={step.options.body ?? '{}'}
                        defaultValue={'{}'}
                        lang="json"
                        onChange={handleBodyChange}
                        debounceTimeout={0}
                      />
                    </Stack>
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
       {responseData && responseData.status ? (
          <div style={{
            backgroundColor: '#cd3838',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            Erro: {responseData.status}
          </div>
        ) : null}
        {testResponse && (
          <CodeEditor
            value={testResponse}
            defaultValue={'{}'}
            lang="json"
            isReadOnly
            debounceTimeout={0}
          />
        )}
        {(successTest) && (
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
      as
    </Stack>
  )
}
