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
  KeyValue,
  WebhookOptions,
  VariableForTest,
  ResponseVariableMapping,
  WebhookStep,
  defaultWebhookAttributes,
  Webhook,
  StepIndices,
  QueryParameters,
  Variable
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
// import { validateUrl } from 'utils'

enum HttpMethodsWebhook {
  POST = "POST",
  GET = "GET",
  PUT = "PUT"
}

export const validateUrl =(url: string) =>{
  const regexp =
		/^((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|\/\/))?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/
	const regexs = /^[/][a-z][a-z0-9.-]{0,49}$/
	const candidate = url.replace(/ /g, '').trim()

	return regexp.test(candidate) || regexs.test(candidate)
}

type Props = {
  step: WebhookStep,
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({
  step,
  onOptionsChange
}: Props) => {
  const { typebot, } = useTypebot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleUrlChange = (url?: string) =>{
    // validateUrl
    if (url && url.length > 5 && validateUrl(url)) {
      const newUrl = new URL(url.replace(/ /g, '').trim())
      url = newUrl.origin
      
      if (newUrl.search) handleParams(newUrl.search)
      
      addParams('path', '', newUrl.pathname, newUrl.pathname)
      
      onOptionsChange({
        ...step.options,
        url: url ? url: ""
      })
    }
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

  const addParams = (type: string, key: string, value:string, displayValue: string, properties?: Variable | undefined) => {
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
//     onOptionsChange({
//       ...step.options,
//       parameters: [...step.options.parameters, ...parameters] as QueryParameters[]
//     })


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

  // const handleVariablesChange = (variablesForTest: VariableForTest[]) =>
  //   onOptionsChange({ ...options, variablesForTest })

  // const handleResponseMappingChange = (
  //   responseVariableMapping: ResponseVariableMapping[]
  // ) => onOptionsChange({ ...options, responseVariableMapping })

  const handleAdvancedConfigChange = (isAdvancedConfig: boolean) =>
    onOptionsChange({ ...step.options, isAdvancedConfig })

  const handleBodyFormStateChange = (isCustomBody: boolean) =>
    onOptionsChange({ ...step.options, isCustomBody })

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

    const { data }  = await sendOctaRequest({
      url: `validate/webhook`,
      method: 'POST',
      body: { 
        session: {}, 
        webhook: localWebhook
      }
    })

    const { response, status, success } = data
    
    setIsTestResponseLoading(false)
    
    if (!success) return toast({ title: 'Error', description: `Não foi possivel realizar a sua integração 😢` })

    if (typeof response === 'object') {
      debugger
      setTestResponse(JSON.stringify(response, undefined, 2))
      setResponseKeys(getDeepKeys(response))
    } else {
      debugger
      setTestResponse(response)
    }
  }

  const ResponseMappingInputs = useMemo(
    () => (props: TableListItemProps<ResponseVariableMapping>) =>
      <DataVariableInputs {...props} dataItems={responseKeys} />,
    [responseKeys]
  )

  // if (!localWebhook) return <Spinner />

  const handlerDefault = (e: any) => {
  }

  return (
    <Stack spacing={4}>
      <Input
        placeholder="Digite o endereço da API ou do sistema"
        defaultValue={step.options.url}
        onChange={handleUrlChange}
        debounceTimeout={0}
      />
      <SwitchWithLabel
        id={'easy-config'}
        label="Selecionar o método da integração"
        initialValue={step.options.isAdvancedConfig ?? true}
        onCheckChange={handleAdvancedConfigChange}
      />
      {(step.options.isAdvancedConfig ?? true) && (
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
                  initialItems={[]}
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
                  onItemsChange={handlerDefault}
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
