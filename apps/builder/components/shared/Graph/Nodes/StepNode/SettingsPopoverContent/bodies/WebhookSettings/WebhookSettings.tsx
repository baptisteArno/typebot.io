import React, { useMemo, useState } from 'react'
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
  VariableLight,
  HttpMethodsWebhook,
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
import { QueryParamsInputs } from './KeyValueInputs'
import { Input, Textarea } from 'components/shared/Textbox'

type Props = {
  step: WebhookStep
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({ step, onOptionsChange }: Props) => {
  const { typebot } = useTypebot()

  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)

  const [testResponse, setTestResponse] = useState<string>()

  const [responseKeys, setResponseKeys] = useState<string[]>([])

  const [successTest, setSuccessTest] = useState<string>()

  const [responseData, setResponseData] = useState({ status: '' })

  const [prevSelectedVariablesForTest, setPrevSelectedVariablesForTest] =
    useState<any>(undefined)

  const errorToast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const successToast = useToast({
    position: 'top-right',
    status: 'success',
  })

  const [webhookUrl, setWebhookUrl] = useState(step.options?.url)
  const [pathPortion, setPath] = useState(step.options?.path)
  // const [bodyPortion, setBody] = useState(step.options?.body)
  const [variablesKeyDown, setVariablesKeyDown] = useState<KeyboardEvent>()

  const getHttpMethodDescription = (method: HttpMethodsWebhook) => {
    switch (method) {
      case HttpMethodsWebhook.GET:
        return 'Buscar ou consultar uma informação'
      case HttpMethodsWebhook.POST:
        return 'Enviar uma nova informação'
      case HttpMethodsWebhook.PUT:
        return 'Atualizar uma informação existente'
      case HttpMethodsWebhook.DELETE:
        return 'Apagar uma informação existente'
      case HttpMethodsWebhook.PATCH:
        return 'Atualizar uma informação existente, enviando somente o necessário'
      case HttpMethodsWebhook.OPTIONS:
        return 'Descobrir quais tipos de requisições são permitidas'
    }
  }

  const effectPathChange = () => {
    handleVariablesHashList(pathPortion)
    onOptionsChange({
      ...step.options,
      path: pathPortion,
    })
  }

  const handlePathChange = (path: string) => {
    setPath(path)
  }

  const clearOptions = () => {
    setResponseData({ status: '' })

    setTestResponse(undefined)

    setSuccessTest('')
  }

  const handleUrlChange = (url: string) => {
    clearOptions()

    setWebhookUrl(url)
  }

  const effectUrlChange = () => {
    if (step.options.url != webhookUrl) clearOptions()

    if (webhookUrl && webhookUrl.length > 5) {
      const newUrl = new URL(
        webhookUrl.replace(/ /g, '').replace(/#/g, '_hash_').trim()
      )

      if (newUrl.search) handleParams(newUrl.search.replace(/_hash_/g, '#'))

      setWebhookUrl(newUrl.origin)

      setPath(newUrl.pathname?.replace(/_hash_/g, '#') || '')

      onOptionsChange({
        ...step.options,
        url: newUrl.origin || '',
        path: newUrl.pathname?.replace(/_hash_/g, '#') || '',
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '#') {
      e.preventDefault()

      setVariablesKeyDown(e)
    }
  }

  const handleVariablesHashList = (variablesHashList: string) => {
    const webhookUrlVariables = variablesHashList.split('/')

    handleAddedVariables(webhookUrlVariables)
  }

  const handleParams = (url: string) => {
    const params = url.substring(1).split('&')

    params.forEach((p) => {
      const keyValue = p.split('=')

      if (keyValue.length === 2) {
        const paramAlreadyExists = step.options.parameters.find(
          (param) => param.key === keyValue[0]
        )

        if (paramAlreadyExists) return

        const paramValueTrimmed = keyValue[1].replace('/', '')

        addParams('query', keyValue[0], paramValueTrimmed, paramValueTrimmed)
      }
    })
  }

  const addParams = (
    type: string,
    key: string,
    value: string,
    displayValue: string,
    properties?: Variable | undefined
  ) => {
    const newParameter = {
      key: key || '',
      value: value || '',
      displayValue: displayValue || '',
      type,
      isNew: true,
      properties: properties,
    }

    step.options.parameters.push(newParameter)

    onOptionsChange({
      ...step.options,
      parameters: { ...step.options.parameters },
    })
  }

  const handleMethodChange = (method: HttpMethodsWebhook) => {
    if (step.options.method != method) clearOptions()

    onOptionsChange({
      ...step.options,
      method: method,
    })
  }

  const handleQueryParamsChange = (parameters: QueryParameters[]) => {
    const properties = parameters.flatMap((p) => p.properties).filter((s) => s)

    if (properties?.length) {
      handleAddedVariables(properties.map((s) => s?.token))
    }

    onOptionsChange({
      ...step.options,
      parameters,
    })
  }

  const handleHeadersChange = (headers: QueryParameters[]) => {
    const properties = headers.flatMap((p) => p.properties).filter((s) => s)

    if (properties?.length) {
      handleAddedVariables(properties.map((s) => s?.token))
    }

    onOptionsChange({
      ...step.options,
      headers: headers.map((h) => {
        return { ...h, type: 'header' }
      }),
    })
  }

  const codeVariableSelected = (
    variable: Pick<Variable, 'id' | 'name' | 'token'>
  ) => {
    setPrevSelectedVariablesForTest(step.options.variablesForTest)

    handleAddedVariables([variable?.token])
  }

  const getUnusedParams = (body: string) => {
    const selectedVariables =
      prevSelectedVariablesForTest ?? step.options.variablesForTest

    if (!selectedVariables) {
      return []
    }

    const unusedParams: VariableForTest[] = []

    selectedVariables.forEach((p: VariableForTest) => {
      const found = body.indexOf(p.token) > -1

      if (found === false) {
        unusedParams.push(p)
      }
    })

    return unusedParams
  }

  const handleBodyChange = (body: string) => {
    const unusedParams = getUnusedParams(body)

    onOptionsChange({
      ...step.options,
      body,
      variablesForTest: step.options.variablesForTest.filter(
        (p) => unusedParams.includes(p) === false
      ),
    })

    setPrevSelectedVariablesForTest(undefined)
  }

  const handleAddedVariables = (addedVariables: Array<string | undefined>) => {
    const selectedVariables = addedVariables
      .flatMap((addedVar: string | undefined) => {
        return typebot?.variables.filter(
          (variable) => variable.token === addedVar
        )
      })
      .filter((s: Variable | undefined) => s) as Array<VariableForTest>

    handleVariablesForTestChange(selectedVariables)
  }

  type aggregate = {
    keys: Array<string>
    variables: Array<VariableForTest>
  }

  const handleVariablesForTestChange = (
    variablesForTest: VariableForTest[]
  ) => {
    const toTest = [
      ...variablesForTest,
      ...(step.options.variablesForTest || []),
    ].reduce(
      (agg: aggregate, curr: VariableForTest) => {
        if (!agg.keys.includes(curr.token)) {
          agg.keys.push(curr.token)
          agg.variables.push(curr)
        }
        return agg
      },
      { keys: [], variables: [] }
    )

    step.options.variablesForTest = toTest.variables
  }

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => {
    onOptionsChange({ ...step.options, responseVariableMapping })
  }

  const handleBodyFormStateChange = (isCustomBody: boolean) =>
    onOptionsChange({ ...step.options, isCustomBody })

  const resolveSession = (
    variablesForTest: VariableForTest[],
    variables: Variable[]
  ) => {
    if (!variablesForTest?.length || !variables?.length) return {}

    const session: Session = {
      propertySpecs: [],
      properties: {},
    }

    variablesForTest.forEach((testVariable) => {
      const variable = variables.find((v) => v.id === testVariable.variableId)
      if (!variable) return

      const light: VariableLight = {
        domain: variable.domain,
        name: variable.name,
        token: variable.token,
        type: variable.type,
        value: testVariable.value,
      }

      session.propertySpecs.push(light)
      if (!session.properties[light.domain])
        session.properties[light.domain] = {}

      session.properties[light.domain][light.name] = {
        spec: light,
        value: testVariable.value,
      }
    })

    return session
  }

  const handleTestRequestClick = async () => {
    if (!typebot || !step.options) return
    setIsTestResponseLoading(true)

    const options = step.options as WebhookOptions
    const parameters = step.options.parameters.concat(options.headers)

    const localWebhook = {
      method: options.method,
      body: options.body,
      path: options.path,
      parameters: parameters,
      url: options.url,
    }

    const session = resolveSession(options.variablesForTest, typebot.variables)

    const { data } = await sendOctaRequest({
      url: `validate/webhook`,
      method: 'POST',
      body: {
        session,
        webhook: localWebhook,
      },
    })

    const { response, success } = data

    setIsTestResponseLoading(false)
    setSuccessTest(success)
    setResponseData(data)
    if (!success) {
      errorToast({
        title: 'Não foi possível executar sua integração.',
      })
    } else {
      successToast({
        title: 'Sua integração está funcionando!',
      })
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

  return (
    <Stack spacing={4}>
      (
      <Stack>
        <HStack justify="space-between">
          <Text>O que você quer fazer ?</Text>
          <DropdownList<HttpMethodsWebhook>
            currentItem={step.options.method}
            onItemSelect={handleMethodChange}
            items={Object.values(HttpMethodsWebhook)}
          />
        </HStack>
        <HStack justify="space-between">
          <Text color="gray.400" fontSize="sm">
            {getHttpMethodDescription(step.options.method)}
          </Text>
        </HStack>
        <Accordion allowToggle allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              URL
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} as={Stack} spacing="6">
              <Input
                placeholder="Digite o endereço da API ou do sistema"
                defaultValue={webhookUrl ?? ''}
                onChange={handleUrlChange}
                onBlur={() => effectUrlChange()}
                value={webhookUrl ?? ''}
                debounceTimeout={5}
                withVariableButton={false}
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Path
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} as={Stack} spacing="6">
              <Stack>
                <Text color="gray.500" fontSize="sm">
                  Edite os parâmetros da sua URL inserindo campos na sua
                  composição (ex.: /<strong>#valor</strong>/valid)
                </Text>
                <label>{step.options.url ?? ''}</label>
                <Textarea
                  placeholder=""
                  onKeyDown={handleKeyDown as never}
                  defaultValue={pathPortion ?? ''}
                  handleOpenVariablesSelect={variablesKeyDown}
                  onChange={handlePathChange}
                  onBlur={() => effectPathChange()}
                  debounceTimeout={5}
                  value={pathPortion}
                />
              </Stack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton justifyContent="space-between">
              Params
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel as={Stack}>
              <Text color="gray.500" fontSize="sm">
                Adicione sua informações ao final da URL da integração
                (ex.:https://apiurl.com/<strong>?cep=#cep</strong>)
              </Text>
              <TableList<QueryParameters>
                initialItems={step.options.parameters as never}
                onItemsChange={handleQueryParamsChange}
                Item={QueryParamsInputs}
                itemsList={step.options.parameters}
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
            <AccordionPanel as={Stack}>
              <Text color="gray.500" fontSize="sm">
                Sua informação no cabeçalho da integração
                <strong> (ex.: Authorization: Basic 1234)</strong>
              </Text>
              <TableList<QueryParameters>
                initialItems={step.options.headers as never}
                onItemsChange={handleHeadersChange}
                Item={QueryParamsInputs}
                addLabel="Adicionar parâmetro"
                type="header"
                debounceTimeout={0}
              />
            </AccordionPanel>
          </AccordionItem>
          {['POST', 'PUT', 'PATCH'].includes(step.options?.method) && (
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
                      Envie sua informação na corpo da integração{' '}
                      <i>Request Body</i> (apenas JSON)
                    </text>
                    <OpenEditorBody
                      value={step.options.body ?? '{}'}
                      lang="json"
                      onChange={handleBodyChange}
                      postVariableSelected={codeVariableSelected}
                      debounceTimeout={0}
                    />
                    <CodeEditor
                      value={step.options.body ?? '{}'}
                      defaultValue={'{}'}
                      lang="json"
                      onChange={handleBodyChange}
                      postVariableSelected={codeVariableSelected}
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
                initialItems={step.options?.variablesForTest as never}
                onItemsChange={handleVariablesForTestChange}
                itemsList={step.options.variablesForTest}
                Item={VariableForTestInputs}
                addLabel="Adicionar variável"
                shouldHideButton={true}
                debounceTimeout={5}
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
            Testar requisição
          </Button>
        )}
        {responseData && responseData.status && !isTestResponseLoading && (
          <div
            style={{
              backgroundColor: successTest ? '#2d8154' : '#cd3838',
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '20px',
            }}
          >
            {successTest
              ? 'A requisição foi bem sucedida'
              : `Erro: ${responseData.status} - Não foi possível executar sua integração.`}
          </div>
        )}
        {testResponse && !isTestResponseLoading && (
          <CodeEditor
            value={testResponse}
            defaultValue={'{}'}
            lang="json"
            isReadOnly
            debounceTimeout={0}
          />
        )}
        {successTest && !isTestResponseLoading && (
          <Accordion allowToggle allowMultiple>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                Salvar variáveis
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} as={Stack} spacing="6">
                <TableList<ResponseVariableMapping>
                  initialItems={step.options.responseVariableMapping as never}
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
