import React, { useEffect, useState } from 'react'

import { Stack, Text, VStack } from '@chakra-ui/layout'

import { DashboardHeader } from 'components/dashboard/DashboardHeader'

import { Seo } from 'components/Seo'

import { TypebotDndContext } from 'contexts/TypebotDndContext'

import {
  Spinner,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  IconButton,
  Badge,
} from '@chakra-ui/react'

import { NextPageContext } from 'next/types'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { BotsService } from 'services/octadesk/bots/bots'

import { EditIcon } from '@chakra-ui/icons'

import { useRouter } from 'next/router'

interface IFlux {
  botId: string
  id: string
  name: string
  enabled: string
  updatedAt: string
}

const DashboardPage = () => {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)

  const [fluxes, setFluxes] = useState<IFlux[]>([])

  useEffect(() => {
    const fetchBots = async (): Promise<void> => {
      const { fluxes } = (await BotsService().getBots('whatsapp', 2)) as {
        fluxes: IFlux[]
      }

      setFluxes(fluxes)

      setIsLoading(false)
    }

    fetchBots()
  }, [])

  const handleRedirect = (botId: string) => {
    router.replace(`/typebots/${botId}/edit`)
  }

  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />

      <DashboardHeader />

      <TypebotDndContext>
        <VStack w="full" justifyContent="center" pt="10" spacing={6}>
          {isLoading ? (
            <>
              <Text>Aguarde...</Text>

              <Spinner />
            </>
          ) : (
            <TableContainer
              w="full"
              maxW="900px"
              border="1px"
              borderColor="gray.200"
              rounded="md"
              marginBottom="50px"
            >
              <Table size="lg" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Roteiro</Th>

                    <Th>Atualizado em</Th>

                    <Th>Status</Th>

                    <Th>Editar</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {fluxes.map((flux) => (
                    <Tr key={flux.id}>
                      <Td>{flux.name}</Td>

                      <Td>{flux.updatedAt}</Td>

                      <Th>
                        <Badge
                          rounded="md"
                          minW="70px"
                          textAlign="center"
                          colorScheme={flux.enabled ? 'green' : 'default'}
                        >
                          {flux.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </Th>

                      <Td>
                        <IconButton
                          aria-label="Editar"
                          icon={<EditIcon />}
                          onClick={() => handleRedirect(flux.botId)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </VStack>
      </TypebotDndContext>
    </Stack>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const redirectPath = context.query.redirectPath?.toString()

  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : {
        props: {
          ...(await serverSideTranslations(context.locale as string, [
            'common',
          ])),
        },
      }
}

export default DashboardPage
