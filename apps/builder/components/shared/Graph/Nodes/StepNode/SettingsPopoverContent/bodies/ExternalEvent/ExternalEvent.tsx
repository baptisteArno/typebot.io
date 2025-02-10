import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, Icon, Input, InputGroup, InputRightElement, Select, Stack, Text, useToast } from "@chakra-ui/react";
import { CodeEditor } from "components/shared/CodeEditor";
import { TableList, TableListItemProps } from "components/shared/TableList";
import { useTypebot } from "contexts/TypebotContext";
import { useSocket } from "hooks/useSocket";
import { ExternalEventOptions, ExternalEventStep, ResponseVariableMapping, TextBubbleContent } from "models";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdContentCopy, MdInfo } from "react-icons/md";
import { mountUrl } from "services/externalEvent";
import { getDeepKeys } from "services/integrations";
import { TextBubbleEditor } from "../../../TextBubbleEditor";
import { DataVariableInputs } from "../WebhookSettings/ResponseMappingInputs";

type IProps = {
  step: ExternalEventStep,
  onOptionsChange: (options: ExternalEventOptions) => void
}

export const ExternalEvent = React.memo(function ExternalEvent({
  step,
  onOptionsChange
}: IProps) {
  const [requestResponse, setRequestResponse] = useState<string>();
  const [request, setRequest] = useState<"receive" | "define">();
  const [responseKeys, setResponseKeys] = useState<string[]>([])
  const [successTest, setSuccessTest] = useState<boolean>();
  const [invalidData, setInvalidData] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();
  const [timeout, setTimeoutValue] = useState<string>(
    () => step?.options?.timeout ?? "5"
  );
  const [url, setUrl] = useState<string>("")
  const { typebot } = useTypebot()
  const {
    connectInSocket,
    disconnectSocket,
    data,
    socketError,
    exceededTimeout,
    clearSocketTimeout
  } = useSocket()

  const disconnectSocketParams = {
    room: `bot-${typebot?.id}-component-${step.id}`,
    emit: {
      eventLeave: "leaveBotComponent"
    },
    paramsForEmit: {
      eventLeft: {
        botId: typebot?.id,
        componentId: step.id
      }
    }
  };
  const room = `bot-${typebot?.id}-component-${step.id}`;
  const color = "#1366C9";
  const MAX_LENGHT_TEXT = 500;
  const orders = [
    'primeira',
    'segunda',
    'terceira',
  ]

  const errorToast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const successToast = useToast({
    position: 'top-right',
    status: 'success',
  })

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => {
    onOptionsChange({ ...step.options, responseVariableMapping })
  }

  const ResponseMappingInputs = useMemo(
    () => (props: TableListItemProps<ResponseVariableMapping>) =>
      <DataVariableInputs {...props} dataItems={responseKeys} />,
    [responseKeys]
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      successToast({ title: 'Copiado com sucesso!' })
    });
  };

  const getUrl = useCallback(async () => {
    if (!typebot?.id) return;

    const url = await mountUrl({ blockId: step.id, botId: typebot.id });
    onOptionsChange({
      ...step.options,
      url: url
    })

    setUrl(url)
  }, [])

  const validationJson = (value: string) => {
    try {
      const json = (typeof value === "object") ? value : JSON.parse(value);

      setInvalidData(false);
      setResponseKeys(getDeepKeys(json))

      onOptionsChange({
        ...step.options,
        body: JSON.stringify(json, undefined, 2)
      })

      return true;
    } catch (err: any) {
      setInvalidData(true);
      return false;
    }
  }

  const onSelect = (e: any) => {
    const value = e.target.value;
    setTimeoutValue(value);
    onOptionsChange({
      ...step.options,
      timeout: value
    })
  }

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: number
  ) => {
    return (
      <Box>
        <Text
          color="black"
          fontFamily="Poppins"
          fontSize="14px"
          fontStyle="bolder"
          lineHeight="24px"
        >
          Após a {orders[index]} mensagem do cliente, diga
        </Text>
        <TextBubbleEditor
          required={{
            errorMsg: `O campo "Mensagem para resposta inválida - Tentativa ${index + 1
              }" é obrigatório`,
          }}
          onClose={(content) => handleFallbackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallbackMessage(content, index)}
          maxLength={MAX_LENGHT_TEXT}
        />
      </Box>
    )
  }

  const handleFallbackMessage = (content: TextBubbleContent, index: number) => {
    if (!step.options) return
    if (!step.options?.fallbackMessages) step.options.fallbackMessages = []

    if (step.options.fallbackMessages.length > index)
      step.options.fallbackMessages[index] = content
    else step.options.fallbackMessages.push(content)

    onOptionsChange({
      ...step.options,
    })
  }

  async function waitRequest() {
    setLoading(true);

    await connectInSocket({
      room,
      emit: {
        eventJoin: "joinBotComponent"
      },
      paramsForEmit: {
        eventJoin: {
          botId: typebot?.id,
          componentId: step.id
        }
      },
      timeout: {
        execute: true,
        time: 30 * 1000
      }
    })
  }

  useEffect(() => {
    if (!data) return;

    const json = (typeof data === "object") ? data : JSON.parse(data);
    setRequest("receive");
    setInvalidData(false);
    setSuccessTest(true);

    setResponseKeys(getDeepKeys(json))

    onOptionsChange({
      ...step.options,
      body: JSON.stringify(json, undefined, 2)
    })

    disconnectSocket(disconnectSocketParams);
    clearSocketTimeout()
  }, [data])

  useEffect(() => {
    if (!socketError) return;

    setLoading(false);
    disconnectSocket(disconnectSocketParams);
    clearSocketTimeout()
    errorToast({ title: 'Houve um erro ao conectar o socket, tente novamente!' });
  }, [socketError])

  useEffect(() => {
    if (!exceededTimeout) return;

    setLoading(false);
    disconnectSocket(disconnectSocketParams);
    clearSocketTimeout()
    errorToast({ title: 'O tempo de resposta foi excedido. Por favor, tente novamente.' });
  }, [exceededTimeout])

  useEffect(() => {
    getUrl();

    validationJson(step?.options?.body);

    return () => {
      disconnectSocket(disconnectSocketParams),
        clearSocketTimeout()
    }
  }, [])

  return (
    <>
      {!request &&
        <Stack w="100" gap="2">
          <Flex w="100" direction="column" gap="1" >
            <Text
              color="black"
              fontFamily="Poppins"
              fontSize="14px"
              fontStyle="normal"
              fontWeight="600"
              lineHeight="24px"
            >
              URL de retorno
            </Text>

            <InputGroup flex="1">
              <Input value={url} bg="#f4f4f5" data-testId="url-input" />
              <InputRightElement>
                <Box
                  data-testId="copy-button"
                  as="button"
                  onClick={handleCopy}
                  cursor="pointer"
                >
                  <MdContentCopy />
                </Box>
              </InputRightElement>
            </InputGroup>

            <Text
              color="black"
              fontFamily="Poppins"
              fontSize="12px"
              fontStyle="normal"
              lineHeight="24px"
              fontWeight="300"
            >
              Essa URL é um endereço personalizado que irá enviar dados ao nosso sistema.
            </Text>
          </Flex>

          <Flex justifyContent="center" alignItems="center" gap="16px" bg="#ecf4fd" borderWidth="1px" borderColor="#5699ea" borderRadius="md" padding="26px">
            <Icon fontSize="2xl" color="#2F4C74">
              <MdInfo />
            </Icon>

            <Text color="#2F4C74" fontFamily="Poppins" fontSize="14px" fontStyle="normal" lineHeight="24px">
              A última informação da URL de retorno deverá ser o ID específico da conversa do cliente.
              Exemplo: https.://[...]/id-conversa
            </Text>
          </Flex>

          <Button
            bg={loading ? "#E3E4E8" : color}
            color={loading ? "#1366c9" : "white"}
            onClick={waitRequest}
            disabled={loading}
            w="100%"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap="8px"
            data-testId="receive-button"
            _disabled={{
              opacity: 1,
              cursor: 'not-allowed'
            }}
          >
            {loading && <div className="loader"></div>}
            {loading ? "Aguardando retorno da requisição" : "Receber Requisição"}
          </Button>

          <Button
            variant="outline"
            borderColor={loading ? "#C4C7CF" : color}
            color={loading ? "#C4C7CF" : color}
            onClick={() => setRequest("define")}
            disabled={loading}
            w="100%"
            data-testId="define-button"
            _disabled={{
              opacity: 1,
              cursor: 'not-allowed'
            }}
          >
            Definir requisição
          </Button>
        </Stack>
      }

      {request &&
        <>
          {request === "receive" &&
            <Flex
              w='100'
              justifyContent='start'
              alignItems='center'
              padding='16px'
              borderRadius='12px'
              gap='12px'
              bg={successTest ? '#09a944' : '#cd3838'}
              marginBottom='16px'
              color='white'
            >
              <Icon fontSize="2xl" color="white">
                <MdCheckCircle />
              </Icon>
              <Text>
                {successTest ? 'A requisição foi bem sucedida'
                  : `Erro: - Não foi possível executar esta chamada externa.`}
              </Text>
            </Flex>
          }

          {request === "define" &&
            <Flex
              bg="white"
              color={color}
              borderColor={color}
              borderWidth="3px"
              borderRadius="12px"
              padding="12px"
              marginBottom="12px"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontFamily="Poppins" fontSize="16px" fontWeight="semibold" lineHeight="24px"> Definir Requisição </Text>
            </Flex>
          }

          <CodeEditor
            value={requestResponse ?? step?.options?.body}
            defaultValue={'{}'}
            lang="json"
            isReadOnly={(request == "define") ? false : true}
            withVariableButton={false}
            debounceTimeout={1000}
            onChange={(newValue) => validationJson(newValue)}
          />

          {invalidData === true &&
            <Text color="#cd3838" fontFamily="Poppins" fontSize="14px" fontWeight="bold" fontStyle="normal" lineHeight="24px">
              Digite um JSON válido!
            </Text>
          }

          {invalidData === false &&
            <Stack marginTop="10px">
              <Accordion allowToggle allowMultiple>
                <AccordionItem>
                  <AccordionButton justifyContent="space-between">
                    Salvar variáveis
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} as={Stack} spacing="6">
                    <TableList<ResponseVariableMapping>
                      initialItems={step.options.responseVariableMapping as any}
                      onItemsChange={handleResponseMappingChange}
                      Item={ResponseMappingInputs}
                      addLabel="Adicionar variável"
                      debounceTimeout={0}
                    />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Stack>
          }

          <Stack marginTop="10px">
            <Accordion allowToggle allowMultiple>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Tempo de espera da requisição
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} as={Stack} spacing="6">
                  <Flex justifyContent="start" alignItems="center" gap="6px">
                    <Select
                      width="80px"
                      value={timeout}
                      onChange={onSelect}
                      data-testId="select-timeout"
                    >
                      {Array.from({ length: 26 }, (_, index) => {
                        const i = index + 5;
                        return (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        );
                      })}
                    </Select>
                    <Text fontFamily="Poppins" fontSize="16px" fontWeight="normal" fontStyle="normal" lineHeight="24px">Minutos</Text>
                  </Flex>
                  <Text fontFamily="Poppins" fontSize="14px" fontWeight="normal" fontStyle="normal" lineHeight="24px">Minutos que aguardará para ter um retorno</Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Stack>

          {step.options?.useFallback &&
            (step.options?.fallbackMessages?.length ? (
              <Stack marginTop="10px">
                <Accordion allowToggle allowMultiple>
                  <AccordionItem>
                    <AccordionButton justifyContent="space-between">
                      <Text fontFamily="Poppins" fontSize="12px" fontWeight="bolder" fontStyle="normal" lineHeight="24px">
                        Se o cliente enviar uma mensagem enquanto aguardamos o evento externo
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} as={Stack} spacing="6">
                      <Flex direction={'column'} gap={4}>
                        {step.options?.fallbackMessages.map((message, index) =>
                          fallbackMessageComponent(message, index)
                        )}
                      </Flex>
                      <Box>
                        <Flex justifyContent="center" alignItems="center" gap="16px" bg="#ecf4fd" borderWidth="1px" borderColor="#5699ea" borderRadius="md" padding="16px">
                          <Icon fontSize="2xl" color="#2F4C74">
                            <MdInfo />
                          </Icon>

                          <Text color="#2F4C74" fontFamily="Poppins" fontSize="14px" fontStyle="normal" lineHeight="24px">
                            Se houver mais de 3 tentativas erradas, o cliente será automaticamente direcionado para a jornada de “em caso de falha”.
                          </Text>
                        </Flex>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Stack>
            ) : (
              <TextBubbleEditor
                onClose={(content) => handleFallbackMessage(content, 0)}
                initialValue={[]}
                onKeyUp={(content) => handleFallbackMessage(content, 0)}
              />
            ))}
        </>
      }
    </>
  )
})
