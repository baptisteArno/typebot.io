import { Box, Button, Flex, Icon, Input, InputGroup, InputRightElement, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { CodeEditor } from "components/shared/CodeEditor";
import { useTypebot } from "contexts/TypebotContext";
import { ExternalEventOptions, ExternalEventStep } from "models";
import React, { useCallback, useEffect, useState } from "react";
import { MdCheckCircle, MdContentCopy, MdInfo } from "react-icons/md";
import { mountUrl } from "services/externalEvent";

type IProps = {
  step: ExternalEventStep,
  onOptionsChange: (options: ExternalEventOptions) => void
}

export const ExternalEvent = React.memo(function ExternalEvent({
  step,
  onOptionsChange
}: IProps) {
  const [request, setRequest] = useState<"receive" | "define">();
  const [successTest, setSuccessTest] = useState<boolean>();
  const [requestResponse, setRequestResponse] = useState<string>();
  const [url, setUrl] = useState<string>("")
  const { typebot } = useTypebot()

  const color = "#1366C9";

  const errorToast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const successToast = useToast({
    position: 'top-right',
    status: 'success',
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      successToast({ title: 'Copiado com sucesso!' })
    });
  };

  const getUrl = useCallback(async () => {
    const url = await mountUrl({ blockId: step.blockId, botId: typebot.id });
    setUrl(url)
  }, [])

  const makeRequest = (async () => {
    try {
      const { data } = await axios.get(`${url}`);
      setRequestResponse(JSON.stringify(data, undefined, 2));
      setRequest("receive");
      setSuccessTest(true);
      successToast({ title: 'Sucesso ao fazer requisição' })
    } catch (err: any) {
      errorToast({ title: 'Erro ao fazer requisição' })
      setSuccessTest(false);
    }
  })

  useEffect(() => {
    getUrl();
  }, []);

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
              <Input value={url} bg="#f4f4f5" />
              <InputRightElement>
                <Box
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
            bg={color}
            color="white"
            onClick={makeRequest}
            w="100%"
          >
            Receber Requisição
          </Button>

          <Button
            variant="outline"
            borderColor={color}
            color={color}
            onClick={() => setRequest("define")}
            w="100%"
          >
            Definir Requisição
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
            value={requestResponse ?? ''}
            defaultValue={'{}'}
            lang="json"
            isReadOnly={(request == "define") ? false : true}
            withVariableButton={false}
            debounceTimeout={0}
          />

          <div>
            Adicionar Variaveis
          </div>
        </>
      }
    </>
  )
})
