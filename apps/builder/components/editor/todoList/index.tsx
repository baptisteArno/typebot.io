import React from 'react'

import {
  Flex,
  VStack,
  CloseButton,
  Tooltip,
  Stack,
  Image,
  Text,
} from '@chakra-ui/react'

import { InfoOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons'

import { Title, Description, StepTitle } from './style'

import { useEditor } from 'contexts/EditorContext'

import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'

import { useTypebot } from 'contexts/TypebotContext'

import { InputStepType } from 'models'

export const ToDoList = () => {
  const { typebot } = useTypebot()

  const { setRightPanel } = useEditor()

  const handleCloseClick = () => {
    setRightPanel(undefined)
  }

  const groupsWithoutConnection = () =>
    typebot?.blocks?.filter((block) => !block.hasConnection)

  const hasGroupsWithoutConnection = () => !!groupsWithoutConnection()?.length

  const showEmptyPendenciesList = () => !hasGroupsWithoutConnection()

  const getShellPath = () =>
    (process.env.BASE_PATH || (window as any).BASE_PATH) + '/images/shell.svg'

  return (
    <Flex
      pos="absolute"
      right="0"
      top="0"
      h="100%"
      w="320px"
      bgColor="white"
      shadow="lg"
      borderLeftRadius="lg"
      p="4"
      zIndex={10}
    >
      <VStack w="full" spacing={4}>
        <Flex
          w="full"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="2"
        >
          <Title>Lista de pendências</Title>

          <CloseButton onClick={handleCloseClick} />

          {!showEmptyPendenciesList() && (
            <Description>
              Antes de continuar, faça as correções necessárias clicando em um
              dos itens com pendência abaixo.
            </Description>
          )}
        </Flex>

        {showEmptyPendenciesList() ? (
          <Stack
            marginLeft="30px"
            marginRight="30px"
            width="100vw"
            height="100vh"
            alignContent="center"
            justifyContent="center"
          >
            <Image
              src={getShellPath()}
              width="100px"
              flexShrink="0"
              alignSelf="center"
              marginBottom="24px"
              alt="Octadesk"
            />

            <Text
              color="black"
              textAlign="center"
              fontFamily="Poppins"
              fontSize="18px"
              fontStyle="normal"
              fontWeight="600"
              lineHeight="24px"
            >
              Nenhuma pendência
            </Text>

            <Text
              color="black"
              textAlign="center"
              fontFamily="Noto Sans"
              fontSize="14px"
              fontStyle="normal"
              fontWeight="400"
              lineHeight="20px"
            >
              Tudo certo com seu roteiro,
              <br /> nenhum pendência encontrada
            </Text>
          </Stack>
        ) : (
          <Flex w="full" flexDirection="column" gap="5">
            {hasGroupsWithoutConnection() && (
              <Flex w="full" flexDirection="column" gap="2.5">
                <Flex
                  w="full"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    gap="6px"
                  >
                    <WarningTwoIcon color="#FAC300" />

                    <Title sm>Grupos sem conexão</Title>
                  </Flex>

                  <Tooltip
                    hasArrow
                    label="Um ou mais grupos do seu bot estão sem conexões."
                    bg="gray.700"
                    color="white"
                    width="232px"
                  >
                    <InfoOutlineIcon color="#5A6377" />
                  </Tooltip>
                </Flex>

                {groupsWithoutConnection()?.map((item) => (
                  <Flex
                    key={item.id}
                    paddingY="3"
                    paddingX="4"
                    rounded="8px"
                    justifyContent="space-between"
                    background="#F4F4F5"
                  >
                    <Flex alignItems="center" gap="2">
                      <StepIcon type={InputStepType.ASK_NAME} />

                      <StepTitle>{item.title}</StepTitle>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}
          </Flex>
        )}
      </VStack>
    </Flex>
  )
}
