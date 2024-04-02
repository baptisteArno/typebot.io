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

import { Title, Description } from './style'

import { useEditor } from 'contexts/EditorContext'

import { useTypebot } from 'contexts/TypebotContext'

import { ErrorIcon } from 'assets/icons'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import EmptyFieldsItem from './emptyFieldsItem'
import GroupsWithoutConnectionItem from './groupsWithoutConectionItem'
import { colors } from 'libs/theme'

export const ToDoList = () => {
  const { typebot, emptyFields } = useTypebot()

  const { setRightPanel } = useEditor()

  const handleCloseClick = () => {
    setRightPanel(undefined)
  }

  const groupsWithoutConnection = () =>
    typebot?.blocks?.filter((block) => !block.hasConnection)

  const hasGroupsWithoutConnection = () => !!groupsWithoutConnection()?.length

  const showEmptyPendenciesList = () =>
    !hasGroupsWithoutConnection() && emptyFields.length < 1

  const groupsWithEmptyFields = () => {
    if (emptyFields.length === 0) return []
    const groups = emptyFields?.map((field) => {
      const hasBlock = typebot?.blocks.find(
        (block) => block.id === field.step.blockId
      )
      if (hasBlock) {
        return {
          ...field,
          graphCordinates: hasBlock.graphCoordinates,
        }
      }
    })

    return groups
  }

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
          <Flex
            w="full"
            flexDirection="column"
            gap="5"
            overflow={'auto'}
            padding={'0 10px'}
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
            css={{
              '&::-webkit-scrollbar': {
                width: '5px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: colors.gray[300],
                borderRadius: '24px',
              },
            }}
          >
            <Flex w="full" flexDirection="column" gap="2.5">
              {groupsWithEmptyFields().length > 0 && (
                <>
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
                      <ErrorIcon color="#d33003" />

                      <Title sm>Campos obrigatórios</Title>
                    </Flex>

                    <Tooltip
                      hasArrow
                      label="Uma ou mais etapas do seu bot estão com campos obrigatórios não preenchidos."
                      bg="gray.700"
                      color="white"
                      width="232px"
                    >
                      <InfoOutlineIcon color="#5A6377" />
                    </Tooltip>
                  </Flex>
                  {emptyFields?.map((item) => {
                    return <EmptyFieldsItem key={item?.step?.id} item={item} />
                  })}
                </>
              )}

              {hasGroupsWithoutConnection() &&
                groupsWithEmptyFields().length > 0 && (
                  <OctaDivider width="100%" />
                )}

              {hasGroupsWithoutConnection() && (
                <>
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
                    <GroupsWithoutConnectionItem key={item.id} item={item} />
                  ))}
                </>
              )}
            </Flex>
          </Flex>
        )}
      </VStack>
    </Flex>
  )
}
