import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Text,
  Heading,
  Checkbox,
  Skeleton,
  Stack,
  Flex,
  useDisclosure,
} from '@chakra-ui/react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useToast } from '@/hooks/useToast'
import { User } from '@typebot.io/prisma'
import React, { useState } from 'react'
import { byId, isDefined } from '@typebot.io/lib'
import { CreateTokenModal } from './CreateTokenModal'
import { useApiTokens } from '../hooks/useApiTokens'
import { ApiTokenFromServer } from '../types'
import { deleteApiTokenQuery } from '../queries/deleteApiTokenQuery'
import { T, useTranslate } from '@tolgee/react'
import { TimeSince } from '@/components/TimeSince'

type Props = { user: User }

export const ApiTokensList = ({ user }: Props) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const { apiTokens, isLoading, mutate } = useApiTokens({
    userId: user.id,
    onError: (e) =>
      showToast({ title: 'Failed to fetch tokens', description: e.message }),
  })
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure()
  const [deletingId, setDeletingId] = useState<string>()

  const refreshListWithNewToken = (token: ApiTokenFromServer) => {
    if (!apiTokens) return
    mutate({ apiTokens: [token, ...apiTokens] })
  }

  const deleteToken = async (tokenId?: string) => {
    if (!apiTokens || !tokenId) return
    const { error } = await deleteApiTokenQuery({ userId: user.id, tokenId })
    if (!error) mutate({ apiTokens: apiTokens.filter((t) => t.id !== tokenId) })
  }

  return (
    <Stack spacing={4}>
      <Heading fontSize="2xl">{t('account.apiTokens.heading')}</Heading>
      <Text>{t('account.apiTokens.description')}</Text>
      <Flex justifyContent="flex-end">
        <Button onClick={onCreateOpen}>
          {t('account.apiTokens.createButton.label')}
        </Button>
        <CreateTokenModal
          userId={user.id}
          isOpen={isCreateOpen}
          onNewToken={refreshListWithNewToken}
          onClose={onCreateClose}
        />
      </Flex>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>{t('account.apiTokens.table.nameHeader')}</Th>
              <Th w="130px">{t('account.apiTokens.table.createdHeader')}</Th>
              <Th w="0" />
            </Tr>
          </Thead>
          <Tbody>
            {apiTokens?.map((token) => (
              <Tr key={token.id}>
                <Td>{token.name}</Td>
                <Td>
                  <TimeSince date={token.createdAt} />
                </Td>
                <Td>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => setDeletingId(token.id)}
                  >
                    {t('account.apiTokens.deleteButton.label')}
                  </Button>
                </Td>
              </Tr>
            ))}
            {isLoading &&
              Array.from({ length: 3 }).map((_, idx) => (
                <Tr key={idx}>
                  <Td>
                    <Checkbox isDisabled />
                  </Td>
                  <Td>
                    <Skeleton h="5px" />
                  </Td>
                  <Td>
                    <Skeleton h="5px" />
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
      <ConfirmModal
        isOpen={isDefined(deletingId)}
        onConfirm={() => deleteToken(deletingId)}
        onClose={() => setDeletingId(undefined)}
        message={
          <Text>
            <T
              keyName="account.apiTokens.deleteConfirmationMessage"
              params={{
                strong: (
                  <strong>{apiTokens?.find(byId(deletingId))?.name}</strong>
                ),
              }}
            />
          </Text>
        }
        confirmButtonLabel={t('account.apiTokens.deleteButton.label')}
      />
    </Stack>
  )
}
